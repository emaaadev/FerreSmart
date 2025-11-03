using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FerreSmart.Models
{
    public class ProductModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public string? name { get; set; }

        public string? category { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal price { get; set; }

        public int stock { get; set; }
    }
}
