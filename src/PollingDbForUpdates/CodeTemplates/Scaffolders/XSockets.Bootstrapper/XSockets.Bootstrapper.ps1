[T4Scaffolding.Scaffolder(Description = "For running XSockets in a hosted application")][CmdletBinding()]
param(        
    [string]$Project,
	[string]$CodeLanguage,
	[string[]]$TemplateFolders,
	[switch]$Force = $false
)

$outputPath = "App_Start\XSocketsBootstrapper"
$namespace = (Get-Project $Project).Properties.Item("DefaultNamespace").Value

Add-ProjectItemViaTemplate $outputPath -Template XSockets.BootstrapperTemplate `
	-Model @{ Namespace = $namespace } `
	-SuccessMessage "Added XSockets.Bootstrapper output at {0}" `
	-TemplateFolders $TemplateFolders -Project $Project -CodeLanguage $CodeLanguage -Force:$Force