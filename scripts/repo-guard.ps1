param(
    [switch]$PreCommit
)

$ErrorActionPreference = "Stop"

function Write-GuardError {
    param([string]$Message)
    Write-Host "[repo-guard] ERROR: $Message" -ForegroundColor Red
}

function Is-AllowlistedPath {
    param([string]$Path)

    $normalized = $Path -replace "\\", "/"
    $allowlist = @(
        '^CLAUDE\.md$',
        '^OWNER\.md$',
        '^README\.md$',
        '^\.github/copilot-instructions\.md$',
        '^\.ai-context/',
        '^scripts/repo-guard\.ps1$',
        '^scripts/install-git-hooks\.ps1$',
        '^\.githooks/pre-commit$'
    )

    foreach ($rule in $allowlist) {
        if ($normalized -match $rule) {
            return $true
        }
    }

    return $false
}

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    Write-Host "[repo-guard] Not inside a git repository."
    exit 0
}

Set-Location $repoRoot

$originUrl = git remote get-url origin 2>$null
if ($originUrl -and ($originUrl -notmatch 'dreamair-web')) {
    Write-Host "[repo-guard] WARNING: origin does not look like dreamair-web: $originUrl" -ForegroundColor Yellow
}

$stagedFilesRaw = git diff --cached --name-only --diff-filter=ACMR
if (-not $stagedFilesRaw) {
    Write-Host "[repo-guard] No staged files."
    exit 0
}

$stagedFiles = $stagedFilesRaw -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

$blockedTerms = @('MenuMat', 'MENUMAT', 'menumat-ecb44ba0')
$blockedPathRegex = '(?i)menumat'
$violations = @()

foreach ($file in $stagedFiles) {
    $normalized = $file -replace "\\", "/"
    $isAllowlisted = Is-AllowlistedPath -Path $file

    if (($normalized -match $blockedPathRegex) -and (-not $isAllowlisted)) {
        $violations += "Zakazany nazov suboru pre DreamAir repo: $file"
    }

    if (-not $isAllowlisted) {
        $diff = git diff --cached -- $file
        if ($diff) {
            $addedLines = $diff -split "`n" | Where-Object { $_ -match '^\+[^+]' }
            foreach ($line in $addedLines) {
                foreach ($term in $blockedTerms) {
                    if ($line -match [regex]::Escape($term)) {
                        $violations += "Zakazany obsah '$term' v: $file"
                        break
                    }
                }
            }
        }
    }
}

if ($violations.Count -gt 0) {
    Write-GuardError "Zisteny mix DreamAir vs MENUMAT. Commit bol zablokovany."
    $violations | Sort-Object -Unique | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    Write-Host "[repo-guard] Presun MENUMAT zmeny do menumat-ecb44ba0 a commit zopakuj." -ForegroundColor Yellow
    exit 1
}

Write-Host "[repo-guard] OK: staged zmeny su DreamAir-only."
exit 0
