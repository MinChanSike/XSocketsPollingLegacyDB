param($installPath, $toolsPath, $package, $project)

Write-Host "Executing XSockets Uninstall.ps1"

Write-Host "Uninstall XSockets packages in the following order:"
Write-Host "1: Uninstall-Package XSockets"
Write-Host "2: Uninstall-Package XSockets.Server"
Write-Host "3: Uninstall-Package XSockets.Core"
Write-Host "4: Uninstall-Package XSockets.JsApi"