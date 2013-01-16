using System.Linq;
using PollingDbForUpdates.Core.Model;

namespace XSockets.Controllers.Model
{
    /// <summary>
    /// We cant return EF models to the client due to proxies, so this way we map EF to a ViewModel
    /// </summary>
    public class SalesViewModel
    {
        public int id { get; set; }
        public string country { get; set; }
        public int hardware { get; set; }
        public int software { get; set; }
        public int services { get; set; }

        //Default ctor for serialization... !IMPORTANT
        public SalesViewModel()
        {
        }

        public SalesViewModel(Sales salesData)
        {
            this.id = salesData.Id;
            this.country = salesData.Country;
            this.hardware = salesData.Hardware;
            this.software = salesData.Software;
            this.services = salesData.Services;
        }
    }
}