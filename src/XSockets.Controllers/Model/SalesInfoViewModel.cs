using System.Collections.Generic;

namespace XSockets.Controllers.Model
{
    public class SalesInfoViewModel
    {
        public IList<SalesViewModel> sales { get; set; }
        public string updated { get; set; }

        public SalesInfoViewModel()
        {
            this.sales = new List<SalesViewModel>();
        }
        public SalesInfoViewModel(IList<SalesViewModel> salesViewModels, string updated)
        {
            this.sales = salesViewModels;
            this.updated = updated;
        }
    }
}