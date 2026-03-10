$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    throw "Not inside a git repository."
}

Set-Location $repoRoot
git config core.hooksPath .githooks
Write-Host "Git hooks path set to .githooks"
Write-Host "Pre-commit guard is now active for DreamAir/MENUMAT separation."
