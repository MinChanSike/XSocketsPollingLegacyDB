param($installPath, $toolsPath, $package, $project)

#install.ps1 v: 2.0
$defaultProject = Get-Project

#if($defaultProject.Type -ne "C#"){
#	Write-Host "Sorry, XSockets is only available for C#"
#	return
#}

$projext = '.csproj'

if($defaultProject.Type -eq 'VB.NET'){
    $projext = '.vbproj'
}

$defaultNamespace = (Get-Project $defaultProject.Name).Properties.Item("DefaultNamespace").Value
$path = $defaultProject.FullName.Replace($defaultProject.Name + $projext,'').Replace('\\','\')
$pluginPath = $path + "XSocketServerPlugins\"
$sln = [System.IO.Path]::GetFilename($dte.DTE.Solution.FullName)
$newProjPath = $dte.DTE.Solution.FullName.Replace($sln,'').Replace('\\','\')
$sln = Get-Interface $dte.Solution ([EnvDTE80.Solution2])

###################################
#Adding plugin info to config     #
###################################
$config = $path + "Web.config"

$webproject = $true

if((Test-Path $config) -eq $false){
    $config = $path + "App.config"
    $webproject = $false
}

Write-Host $config

if((Test-Path $config) -eq $true){   

    Write-Host "Getting content of $config."
    $xml = [xml](get-content($config))

    Write-Host "Adding appsettings in $config"

    if($xml.configuration['appSettings'] -eq $null){
        Write-Host 'Add appsettings'
        $a = $xml.CreateElement('appSettings')
        $xml.configuration.AppendChild($a)
    }

    if(($xml.configuration['appSettings'].add | Where-Object {$_.key -eq 'XSockets.PluginCatalog'}) -eq $null){
        $pluginCatalog = $xml.CreateElement('add')
        $pluginCatalog.setAttribute('key','XSockets.PluginCatalog')
        #XSockets\XSocketServerPlugins\
        $pluginCatalog.setAttribute('value','')
        $xml.configuration["appSettings"].AppendChild($pluginCatalog)
    }

    if(($xml.configuration['appSettings'].add | Where-Object {$_.key -eq 'XSockets.PluginFilter'}) -eq $null){
        $pluginFilter = $xml.CreateElement('add')
        $pluginFilter.setAttribute('key','XSockets.PluginFilter')
        if($webproject -eq $false){
            $pluginFilter.setAttribute('value','*.dll,*.exe')
        }
        else{
            $pluginFilter.setAttribute('value','*.dll')        
        }
        $xml.configuration["appSettings"].AppendChild($pluginFilter)
    }

    Write-Host "Saving $config."
    $xml.Save($config)
}
#Add bootstrapper if webproject
if($webproject -eq $true){
    Scaffold XSockets.Bootstrapper
    
    ###################################
    #Add fallback if MVC
    ###################################
    Install-Package XSockets.Fallback -ProjectName $defaultProject.Name
    
    ###################################
    #Add JsAPI if WEB
    ###################################
    Install-Package XSockets.JsApi -ProjectName $defaultProject.Name
    
    Write-Host ""
    Write-Host "######################################################################################################" -ForegroundColor Green
    Write-Host "If you are new to the XSockets.NET JavaScript API, consider installing the package XSockets.Tutorials" -ForegroundColor Blue
    Write-Host "Install-Package XSockets.Tutorials" -ForegroundColor Blue
    Write-Host "######################################################################################################" -ForegroundColor Green
}

#Write example code if not webproject
if($webproject -eq $false){
Write-Host ""
Write-Host "//How to start a server (example)"
Write-Host "//using XSockets.Core.Common.Socket;"
Write-Host "using (var server = XSockets.Plugin.Framework.Composable.GetExport<IXBaseServerContainer>())" 
Write-Host "{"
Write-Host "    server.StartServers();"
Write-Host "    Console.WriteLine(""Started, hit enter to quit"");"
Write-Host "    Console.ReadLine();"
Write-Host "    server.StopServers();"
Write-Host "}"
}

$dte.ExecuteCommand('View.Url','http://xsockets.net/release-notes')