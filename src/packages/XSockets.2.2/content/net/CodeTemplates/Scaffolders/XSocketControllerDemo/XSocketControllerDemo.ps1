[T4Scaffolding.Scaffolder(Description = "Enter a description of XSocketControllerDemo here")][CmdletBinding()]
param(        	 
    [string]$Project,
	[string]$CodeLanguage,
	[string[]]$TemplateFolders,
	[switch]$Force = $false
)

$outputPath = "Example\ChatHandler"

Add-ProjectItemViaTemplate $outputPath -Template XSocketControllerDemoTemplate `
	-Model @{ Dummy = "" } `
	-SuccessMessage "Added XSocketControllerDemo output at {0}" `
	-TemplateFolders $TemplateFolders -Project XSockets.Controllers -CodeLanguage $CodeLanguage -Force:$Force