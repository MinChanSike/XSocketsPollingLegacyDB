using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Ninject.Modules;
using PollingDbForUpdates.Core.Interfaces.Data;
using PollingDbForUpdates.Core.Interfaces.Service;
using PollingDbForUpdates.Data;
using PollingDbForUpdates.Service;

namespace XSockets.Controllers.Ninject
{
    /// <summary>
    /// Provides access to the servicelayer
    /// </summary>
    public class ServiceModule : NinjectModule
    {
        public override void Load()
        {
            //Setup Ninject bindings...
            Bind<IUnitOfWork>().To<UnitOfWork>().InThreadScope();
            Bind<IDatabaseFactory>().To<DatabaseFactory>().InThreadScope();
            Bind<ISalesRepository>().To<SalesRepository>().InThreadScope();
            Bind<ISalesService>().To<SalesService>().InThreadScope();
        }
    }
}
