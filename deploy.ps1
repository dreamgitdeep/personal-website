# PowerShell deployment helper for personal website
# Usage:
#   .\deploy.ps1 -Message "发布更新"

param(
    [string]$Message = "deploy: update site"
)

Write-Host "Staging all changes..." -ForegroundColor Cyan
git add -A

Write-Host "Committing with message: $Message" -ForegroundColor Cyan
git commit -m $Message

Write-Host "Pushing to origin main..." -ForegroundColor Cyan
git push origin main

Write-Host "Done. Your changes are on the remote repository." -ForegroundColor Green
