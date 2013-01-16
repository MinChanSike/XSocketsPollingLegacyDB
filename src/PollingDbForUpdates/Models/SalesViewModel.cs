using PollingDbForUpdates.Core.Model;

namespace PollingDbForUpdates.Models
{
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