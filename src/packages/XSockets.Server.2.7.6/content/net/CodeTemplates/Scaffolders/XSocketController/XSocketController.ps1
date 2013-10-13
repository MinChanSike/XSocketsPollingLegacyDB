[T4Scaffolding.Scaffolder(Description = "Creates a new handler into a ClassLib. Will add a new project if it does not exist.")][CmdletBinding()]
param(        
	[parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)][string]$HandlerName,
	[parameter(Mandatory = $false, ValueFromPipelineByPropertyName = $true)][string]$LongRunning = "no",
	[parameter(Mandatory = $false, ValueFromPipelineByPropertyName = $true)][string]$ModelName = "",
	[parameter(Mandatory = $false, ValueFromPipelineByPropertyName = $true)][string]$ProjectName = "",	 
	[string]$Project,
	[string]$CodeLanguage,
	[string[]]$TemplateFolders,
	[switch]$Force = $false
)

$defaultProject = Get-Project

#
#Use default proj if not set
#
if($ProjectName -eq ""){ $ProjectName = $Project }

$currentProj = Get-Project $Project
$defaultProjectName = [System.IO.Path]::GetFilename($currentProj.FullName)
$refPath =  $currentProj.FullName.Replace($defaultProjectName,'')

#
#Get PluginPath to set in post build event
#
$sln = [System.IO.Path]::GetFilename($dte.DTE.Solution.FullName)
$path = $dte.DTE.Solution.FullName.Replace($sln,'').Replace('\\','\')
$pluginPath = $path + "XSocketServerPlugins"
$sln = Get-Interface $dte.Solution ([EnvDTE80.Solution2])

#
#Add new project if it does not exist
#
if(($DTE.Solution.Projects | Select-Object -ExpandProperty Name) -notcontains $ProjectName){
Write-Host "Adding new project"
$templatePath = $sln.GetProjectTemplate("ClassLibrary.zip","CSharp")
$sln.AddFromTemplate($templatePath, $path+$ProjectName,$ProjectName)
$file = Get-ProjectItem "Class1.cs" -Project $ProjectName
$file.Remove()

Write-Host (Get-Project $ProjectName).Name Installing : XSockets.Core -ForegroundColor DarkGreen
Install-Package XSockets.Core -ProjectName (Get-Project $ProjectName).Name

#Add reference to new project in main project
(Get-Project $Project).Object.References.AddProject((Get-Project $ProjectName))
}

if($HandlerName.lastindexOf("\") -eq -1){
	$addedNS = ""
	$fileName = "$($HandlerName)"
}
else{
	$addedNS = "." + $HandlerName.Substring(0,$HandlerName.lastindexOf("\")).Replace("\",".")
	$fileName =  $HandlerName.Substring($HandlerName.lastindexOf("\")+1)
}
$namespace = (Get-Project $ProjectName).Properties.Item("DefaultNamespace").Value + $addedNS

$outputPath = "$($HandlerName)"

#
#Create handler (strongly typed or just empty)
#
if($ModelName -eq ""){
	if($LongRunning -eq "no"){
		Add-ProjectItemViaTemplate $outputPath -Template XSocketBasicControllerTemplate `
			-Model @{ Namespace = $namespace; HandlerName = $fileName } `
			-SuccessMessage "Added XSocketBasicController output at {0}" `
			-TemplateFolders $TemplateFolders -Project $ProjectName -CodeLanguage $CodeLanguage -Force:$Force
	}
	else{
		Add-ProjectItemViaTemplate $outputPath -Template XSocketLongRunningControllerTemplate `
			-Model @{ Namespace = $namespace; HandlerName = $fileName } `
			-SuccessMessage "Added XSocketLongRunningControllerTemplate output at {0}" `
			-TemplateFolders $TemplateFolders -Project $ProjectName -CodeLanguage $CodeLanguage -Force:$Force
	}
}
else{
	Add-ProjectItemViaTemplate $outputPath -Template XSocketStronglyTypedControllerTemplate `
		-Model @{ Namespace = $namespace; HandlerName = $fileName; ModelName = $ModelName } `
		-SuccessMessage "Added XSocketStronglyTypedController output at {0}" `
		-TemplateFolders $TemplateFolders -Project $ProjectName -CodeLanguage $CodeLanguage -Force:$Force
}

#Create test-page for the new handler into default project

