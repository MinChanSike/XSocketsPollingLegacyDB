[T4Scaffolding.Scaffolder(Description = "Creates a new custom configuration. Will add a new project if the target does not exist.")][CmdletBinding()]
param(        
	[parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)][string]$PathAndName,
	[parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)][string]$URI,
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

if($defaultProject.Type -eq "C#"){
    $templatePath = $sln.GetProjectTemplate("ClassLibrary.zip","CSharp")
    $sln.AddFromTemplate($templatePath, $path+$ProjectName,$ProjectName)
    $file = Get-ProjectItem "Class1.cs" -Project $ProjectName   
    $file.Remove()	
}
if($defaultProject.Type -eq "VB.NET"){
    $templatePath = $sln.GetProjectTemplate("ClassLibrary.zip","VisualBasic")
    $sln.AddFromTemplate($templatePath, $path+$ProjectName,$ProjectName)
    $file = Get-ProjectItem "Class1.vb" -Project $ProjectName   
    $file.Remove()	
}


Write-Host (Get-Project $ProjectName).Name Installing : XSockets.Core -ForegroundColor DarkGreen
Install-Package XSockets.Core -ProjectName (Get-Project $ProjectName).Name

#Add reference to new project in main project
(Get-Project $Project).Object.References.AddProject((Get-Project $ProjectName))
}

if($PathAndName.lastindexOf("\") -eq -1){
	$addedNS = ""
	$fileName = "$($PathAndName)"
}
else{
	$addedNS = "." + $PathAndName.Substring(0,$PathAndName.lastindexOf("\")).Replace("\",".")
	$fileName =  $PathAndName.Substring($PathAndName.lastindexOf("\")+1)
}
$namespace = (Get-Project $ProjectName).Properties.Item("DefaultNamespace").Value + $addedNS

$outputPath = "$($PathAndName)"

#
#Create custom configuration
#
Add-ProjectItemViaTemplate $outputPath -Template XSockets.ConfigurationTemplate `
	-Model @{ Namespace = $namespace; ClassName = $fileName; URI = $URI } `
	-SuccessMessage "Added CustomConfiguration output at {0}" `
	-TemplateFolders $TemplateFolders -Project $ProjectName -CodeLanguage $CodeLanguage -Force:$Force