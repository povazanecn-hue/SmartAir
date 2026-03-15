[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
    [string]$DesktopMirrorRoot = (Join-Path ([Environment]::GetFolderPath("Desktop")) "DreamAir-Workspace-Mirror"),
    [switch]$IncludeSiblingRepos,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[SYNC] $Message" -ForegroundColor Cyan
}

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Mirror-Folder {
    param(
        [string]$Source,
        [string]$Destination,
        [switch]$DryRun
    )

    Ensure-Dir -Path $Source
    Ensure-Dir -Path $Destination

    $cmd = @("robocopy", "`"$Source`"", "`"$Destination`"", "/MIR", "/R:1", "/W:1", "/NFL", "/NDL", "/NP")
    if ($DryRun) { $cmd += "/L" }

    $joined = $cmd -join " "
    Write-Step "Mirror: $joined"
    cmd /c $joined | Out-Null

    if ($LASTEXITCODE -ge 8) {
        throw "Robocopy failed with exit code $LASTEXITCODE"
    }
}

function Classify-RelativePath {
    param([string]$RelativePath)

    $p = $RelativePath.Replace('/', '\').ToLowerInvariant()

    if ($p -like "frontend\figma\*") { return "designs\figma-html" }
    if ($p -like "output\playwright\*") { return "designs\screenshots" }
    if ($p -like "docs\*") {
        if ($p -match "mockup|dizajn|design|figma|ux|ui") { return "designs\docs" }
    }
    if ($p -match "firecrawl|scrape|scraping") { return "scraping\firecrawl" }
    if ($p -like "data\*.csv") { return "scraping\catalog-csv" }

    return "other\unclassified"
}

function Get-RepoRoots {
    param([string]$MainRepo, [switch]$AddSiblings)

    $roots = [System.Collections.Generic.List[string]]::new()
    $roots.Add((Resolve-Path $MainRepo).Path)

    if ($AddSiblings) {
        $parent = Split-Path -Parent $MainRepo
        Get-ChildItem -Path $parent -Directory | ForEach-Object {
            if (Test-Path (Join-Path $_.FullName ".git")) {
                $roots.Add($_.FullName)
            }
        }
    }

    return $roots | Select-Object -Unique
}

$assetsRoot = Join-Path $RepoRoot "workspace-assets"
$stagingRoot = Join-Path $assetsRoot "staging"

Ensure-Dir -Path $assetsRoot
Ensure-Dir -Path $stagingRoot

$repoRoots = Get-RepoRoots -MainRepo $RepoRoot -AddSiblings:$IncludeSiblingRepos
$includePatterns = @("*.csv", "*.png", "*.jpg", "*.jpeg", "*.webp", "*.svg", "*.json", "*.html", "*.md")
$excludeFragments = @("\.git\", "\node_modules\", "\.venv\", "\venv\", "\dist\", "\build\")

Write-Step "Analyzing repos: $($repoRoots -join ', ')"

foreach ($root in $repoRoots) {
    $repoName = Split-Path -Leaf $root
    $repoStage = Join-Path $stagingRoot $repoName
    Ensure-Dir -Path $repoStage

    $files = Get-ChildItem -Path $root -Recurse -File -Include $includePatterns -ErrorAction SilentlyContinue

    foreach ($file in $files) {
        $full = $file.FullName
        $skip = $false
        $lower = $full.ToLowerInvariant()
        foreach ($fragment in $excludeFragments) {
            if ($lower.Contains($fragment)) { $skip = $true; break }
        }
        if ($skip) { continue }

        $relative = $full.Substring($root.Length).TrimStart('\\','/')
        $bucket = Classify-RelativePath -RelativePath $relative
        $target = Join-Path (Join-Path $repoStage $bucket) $relative
        $targetDir = Split-Path -Parent $target
        Ensure-Dir -Path $targetDir

        if ($WhatIf) {
            Write-Host "[DRY-RUN] Copy '$relative' -> '$bucket'"
        } else {
            Copy-Item -LiteralPath $full -Destination $target -Force
        }
    }

    $desktopRepoMirror = Join-Path $DesktopMirrorRoot $repoName
    Mirror-Folder -Source $repoStage -Destination $desktopRepoMirror -DryRun:$WhatIf
}

Write-Step "Done. Staging assets: $stagingRoot"
Write-Step "Desktop mirror: $DesktopMirrorRoot"
