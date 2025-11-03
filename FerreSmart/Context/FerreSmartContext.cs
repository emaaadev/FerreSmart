using FerreSmart.Models;
using Microsoft.EntityFrameworkCore;

namespace FerreSmart.Context
{
    public class FerreSmartContext : DbContext
    {
        public FerreSmartContext(DbContextOptions options)
            : base(options)
        {

        }

        public DbSet<ProductModel> Product { get; set; }
    }
}
