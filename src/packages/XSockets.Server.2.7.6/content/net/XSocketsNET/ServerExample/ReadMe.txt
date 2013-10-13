Showing howto start a XSockets.NET server

//1: WebApplication, use PreApplicationStartMethod

using System.Web;
[assembly: PreApplicationStartMethod(typeof(YourWebApp.App_Start.XSocketsBootstrap), "Start")]


//Server instance
using XSockets.Core.Common.Socket;

//Create class for the server instance
public static class XSocketsBootstrap
{
    private static IXBaseServerContainer wss;
    public static void Start()
    {            
        wss = XSockets.Plugin.Framework.Composable.GetExport<IXBaseServerContainer>();
        wss.StartServers();
    }
}

//2: Console Application
using (var server = XSockets.Plugin.Framework.Composable.GetExport<IXBaseServerContainer>())
{
    server.StartServers();
    Console.WriteLine("Server started, hit enter to quit");
    Console.ReadLine();
}