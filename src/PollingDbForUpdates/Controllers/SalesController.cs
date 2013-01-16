using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PollingDbForUpdates.Core.Interfaces.Service;
using PollingDbForUpdates.Models;

namespace PollingDbForUpdates.Controllers
{
    public class SalesController : Controller
    {
        public ISalesService SalesService { get; set; }

        public SalesController(ISalesService salesService)
        {
            this.SalesService = salesService;
        }

        [HttpPost]
        public JsonResult Update(IList<SalesViewModel> sales)
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
            return new JsonResult{Data = new {Status = "Ok"}};
        }

    }
}
