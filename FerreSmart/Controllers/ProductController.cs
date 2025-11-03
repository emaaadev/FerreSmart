using FerreSmart.Context;
using FerreSmart.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FerreSmart.Controllers
{
    [Route("api/ferreSmart")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly FerreSmartContext _context;

        public ProductController(FerreSmartContext context)
        {
            _context = context;
        }

        [HttpGet]  /* Hecho por: Emanuel  3-11-2025  2:44am */
        [Route("obtenerProductos")]
        public async Task<IActionResult> GetProducto()
        {
            try
            {

                var product = await _context.Product.ToListAsync();

                if (product == null)
                {
                    return NotFound(new { success = false, message = "No hay productos registrados." });
                }

                return Ok(product);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener los productos {ex.Message}");
                return StatusCode(500, "Ocurrio un error al obtener los productos");
            }

        }

        [HttpPost]   /* Hecho por: Emanuel  3-11-2025  2:50am */
        [Route("crearProducto")]
        public async Task<IActionResult> CrearProducto([FromBody] ProductModel request)
        {
            try
            {
                // Validar que los datos no sean nulos
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Debe enviar los datos del producto." });
                }

                // Validaciones de campos obligatorios
                if (string.IsNullOrWhiteSpace(request.name))
                {
                    return BadRequest(new { success = false, message = "El nombre del producto es obligatorio." });
                }

                if (string.IsNullOrWhiteSpace(request.category))
                {
                    return BadRequest(new { success = false, message = "La categoría del producto es obligatoria." });
                }

                if (request.price <= 0)
                {
                    return BadRequest(new { success = false, message = "El precio debe ser mayor que cero." });
                }

                if (request.stock < 0)
                {
                    return BadRequest(new { success = false, message = "El stock no puede ser negativo." });
                }

                // Crear y agregar producto directamente aqui
                var product = new ProductModel
                {
                    name = request.name,
                    category = request.category,
                    price = request.price,
                    stock = request.stock
                };

                await _context.Product.AddAsync(product);   // Aqui se agrega el producto
                await _context.SaveChangesAsync();          // Aqui se guarda en la BD

                return Ok(new
                {
                    success = true,
                    message = "Producto creado correctamente.",
                    data = product
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear el producto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrio un error al crear el producto.",
                    error = ex.Message
                });
            }
        }
    }
}
