##############################################################################
# Copyright (c) 2012 
# Ulf Bj?rklund
# http://average-uffe.blogspot.com/
# http://twitter.com/codeplanner
# http://twitter.com/ulfbjo
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
##############################################################################
[T4Scaffolding.Scaffolder(Description = "Enter a description of CodePlanner.Data here")][CmdletBinding()]
param(        
    [string]$Project,
	[string]$CodeLanguage,
	[string[]]$TemplateFolders,
	[switch]$Force = $false
)

##############################################################
# NAMESPACE
##############################################################
$namespace = (Get-Project $Project).Properties.Item("DefaultNamespace").Value
$rootNamespace = $namespace
$dotIX = $namespace.LastIndexOf('.')
if($dotIX -gt 0){
	$rootNamespace = $namespace.Substring(0,$namespace.LastIndexOf('.'))
}

##############################################################
# Project Name
##############################################################
$coreProjectName = $rootNamespace + ".Core"
$dataProjectName = $rootNamespace + ".Data"
#$dataProjectNamespace = (Get-Project $dataProjectName).Properties.Item("DefaultNamespace").Value

##############################################################
# Add Data Repository - BaseRepository
##############################################################
$outputPath = "BaseRepository"
$namespace = $dataProjectName
$ximports = $coreProjectName + ".Model," + $coreProjectName + ".Interfaces.Data," + $coreProjectName + ".Interfaces.Paging," + $coreProjectName + ".Common.Paging"

Add-ProjectItemViaTemplate $outputPath -Template BaseRepository `
	-Model @{ Namespace = $namespace; ExtraUsings = $ximports } `
	-SuccessMessage "Added BaseRepository at {0}" `
	-TemplateFolders $TemplateFolders -Project $dataProjectName -CodeLanguage $CodeLanguage -Force:$Force

$file = Get-ProjectItem "$($outputPath).cs" -Project $dataProjectName
$file.Open()
$file.Document.Activate()
$DTE.ActiveDocument.Save()

##############################################################
# Add Data UOW - UnitOfWork
##############################################################
$outputPath = "UnitOfWork"
$namespace = $dataProjectName
$ximports = $coreProjectName + ".Model," + $coreProjectName + ".Interfaces.Data"

Add-ProjectItemViaTemplate $outputPath -Template UnitOfWork `
	-Model @{ Namespace = $namespace; ExtraUsings = $ximports } `
	-SuccessMessage "Added UnitOfWork at {0}" `
	-TemplateFolders $TemplateFolders -Project $dataProjectName -CodeLanguage $CodeLanguage -Force:$Force

$file = Get-ProjectItem "$($outputPath).cs" -Project $dataProjectName
$file.Open()
$file.Document.Activate()
$DTE.ActiveDocument.Save()

##############################################################
# Add Data DatabaseFactory - DatabaseFactory
##############################################################
$outputPath = "DatabaseFactory"
$namespace = $dataProjectName
$ximports = $coreProjectName + ".Interfaces.Data"

Add-ProjectItemViaTemplate $outputPath -Template DatabaseFactory `
	-Model @{ Namespace = $namespace; ExtraUsings = $ximports } `
	-SuccessMessage "Added DatabaseFactory at {0}" `
	-TemplateFolders $TemplateFolders -Project $dataProjectName -CodeLanguage $CodeLanguage -Force:$Force

$file = Get-ProjectItem "$($outputPath).cs" -Project $dataProjectName
$file.Open()
$file.Document.Activate()
$DTE.ActiveDocument.Save()

##############################################################
# Add Data DataContext - DataContext
##############################################################
$outputPath = "DataContext"
$namespace = $dataProjectName
$ximports = $coreProjectName + ".Model," + $coreProjectName + ".Interfaces.Data"

Add-ProjectItemViaTemplate $outputPath -Template DataContext `
	-Model @{ Namespace = $namespace; ExtraUsings = $ximports } `
	-SuccessMessage "Added DataContext at {0}" `
	-TemplateFolders $TemplateFolders -Project $dataProjectName -CodeLanguage $CodeLanguage -Force:$Force

$file = Get-ProjectItem "$($outputPath).cs" -Project $dataProjectName
$file.Open()
$file.Document.Activate()
$DTE.ActiveDocument.Save()