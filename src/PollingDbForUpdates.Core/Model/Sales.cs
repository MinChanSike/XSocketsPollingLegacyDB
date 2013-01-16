using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PollingDbForUpdates.Core.Model
{
    public class Sales : PersistentEntity
    {
        public string Country { get; set; }
        public int Hardware { get; set; }
        public int Software { get; set; }
        public int Services { get; set; }
    }
}
