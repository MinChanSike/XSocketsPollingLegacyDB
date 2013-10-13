using System;
using System.Linq;
using System.Timers;
using Ninject;
using PollingDbForUpdates.Core.Interfaces.Service;
using XSockets.Controllers.Model;
using XSockets.Controllers.Ninject;
using XSockets.Core.Common.Globals;
using XSockets.Core.Common.Socket;
using XSockets.Core.XSocket;
using XSockets.Core.XSocket.Helpers;
using XSockets.Plugin.Framework.Core;

namespace XSockets.Controllers
{
    /// <summary>
    /// This is a singleton plugin.
    /// You cant connect to it from a client, it like a longrunning process in the server!
    /// </summary>
    [XBaseSocketMetadata("PollingController", Constants.GenericTextBufferSize, PluginRange.Internal)]
    public class PollingController : XBaseSocket
    {
        private static SalesController me;
        private static readonly Timer timer;
        private static DateTime latestUpdate { get; set; }

        private static IKernel kernel;

        static PollingController()
        {
            //Create the kernel once
            me = new SalesController();
            kernel = new StandardKernel(new ServiceModule());
            
            //First time we want data so set time to future...
            latestUpdate = DateTime.Now.AddHours(1);

            timer = new Timer(3000);
            timer.Elapsed += new ElapsedEventHandler(timer_Elapsed);
            timer.Start();
        }

        //Ticks every X seconds...
        //Ugly but still better that one client is doing this than every client connected to your web (hundred?/thousands?)
        //
        //The important thing in this POC is how this can be done...
        //In this example I jjust check the latest update in the result of my query to know if data is changed.
        //You would probably do it in another (nicer) way in your solution
        static void timer_Elapsed(object sender, ElapsedEventArgs e)
        {
            try
            {
                using (var a = kernel.BeginBlock())
                {
                    var service = a.Get<ISalesService>();
                    //We will be using GetAllReadOnly to get fresh data since this uses "AsNoTracking" in EF
                    var salesData = service.GetAllReadOnly().ToList();

                    //Check if there where any updates... since last check
                    var updated =
                        Convert.ToDateTime(salesData.OrderByDescending(p => p.Updated).Select(p => p.Updated).First());
                    if (latestUpdate > DateTime.Now)
                        latestUpdate = updated.AddSeconds(-1);

                    var updatedSales = salesData.Select(sales => new SalesViewModel(sales)).ToList();

                    if (updatedSales.Count > 0 && latestUpdate < updated)
                    {
                        latestUpdate = updated;
                        //Send the data to the SalesController... The controller will then send it to all clients listening.
                        me.RouteTo<SalesController>(
                            new SalesInfoViewModel(updatedSales,
                                salesData.OrderByDescending(p => p.Updated).Select(p => p.Updated).First()),
                            "SalesUpdated");
                    }
                }

            }
            catch
            {
                
            }
        }
    }
}
