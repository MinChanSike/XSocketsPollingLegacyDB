using System;
using System.Collections.Generic;
using System.Linq;
using Ninject;
using PollingDbForUpdates.Core.Interfaces.Service;
using PollingDbForUpdates.Service;
using XSockets.Controllers.Model;
using XSockets.Controllers.Ninject;
using XSockets.Core.XSocket;
using XSockets.Core.XSocket.Helpers;

namespace XSockets.Controllers
{
    public class SalesController : XSocketController
    {
        //Reference to the service layer
        private ISalesService SalesService;
        //Ninject
        private static IKernel kernel;

        static SalesController()
        {
            //Create the kernel once
            kernel = new StandardKernel(new ServiceModule());            
        }

        public SalesController()
        {
            //When a new instance/connection is made get the Service
            this.SalesService = kernel.Get<SalesService>();
        }

        /// <summary>
        /// Send the sales to the client asking for it
        /// </summary>
        public void GetSales()
        {
            try
            {
                var salesData = this.SalesService.GetAllReadOnly().ToList();

                var salesInfo  = new SalesInfoViewModel(salesData.Select(sales => new SalesViewModel(sales)).ToList(), salesData.OrderByDescending(p => p.Updated).Select(p => p.Updated).First());
                this.Send(salesInfo, "sales-updated");
            }
            catch (Exception ex)
            {
                this.SendError(ex,"Error in SalesController.GetSales");
            }
        }

        /// <summary>
        /// Send the sales to everyone!
        /// </summary>
        /// <param name="sales"></param>
        public void SalesUpdated(SalesInfoViewModel salesInfo)
        {
            try
            {
                this.SendToAll(salesInfo, "sales-updated");
            }
            catch (Exception ex)
            {
                this.SendError(ex, "Error in SalesController.SalesUpdated");
            }

        }

        /// <summary>
        /// Update the database with new values...
        /// </summary>
        /// <param name="sales"></param>
        public void UpdateSales(IList<SalesViewModel> sales)
        {
            try
            {
                foreach (var salesViewModel in sales)
                {
                    var entity = this.SalesService.GetById(salesViewModel.id);
                    if (entity != null)
                    {
                        entity.Hardware = salesViewModel.hardware;
                        entity.Software = salesViewModel.software;
                        entity.Services = salesViewModel.services;
                        this.SalesService.SaveOrUpdate(entity);
                    }
                }
                this.SalesUpdated(new SalesInfoViewModel(sales,DateTime.Now.ToString()));
            }
            catch (Exception ex)
            {
                this.SendError(ex, "Error in SalesController.UpdateSales");
            }
        }
    }
}
