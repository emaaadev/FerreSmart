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
<<<<<<< Updated upstream
=======

        [HttpPut] /* Hecho por: Wandrys Ferrand  3-11-2025 3:49am*/
        [Route("actualizarProducto/{id}")]
        public async Task<IActionResult> ActualizarProducto(int id, [FromBody] ProductModel request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "Debe enviar los datos del producto a actualizar." });
                }

                // Buscar el producto existente en la BD
                var existingProduct = await _context.Product.FindAsync(id);

                if (existingProduct == null)
                {
                    return NotFound(new { success = false, message = "No se encontro el producto con el ID especificado." });
                }

                // Actualizar los campos
                existingProduct.name = request.name ?? existingProduct.name;
                existingProduct.category = request.category ?? existingProduct.category;
                existingProduct.price = request.price > 0 ? request.price : existingProduct.price;
                existingProduct.stock = request.stock >= 0 ? request.stock : existingProduct.stock;

                // Guardar los cambios
                _context.Product.Update(existingProduct);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Producto actualizado correctamente.",
                    data = existingProduct
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar el producto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrio un error al actualizar el producto.",
                    error = ex.Message
                });
            }
        }

        [HttpPatch] /* Hecho por: Wandrys Ferrand  3-11-2025 4:47am*/
        [Route("actualizarAutomaticamente/{id}")]
        public async Task<IActionResult> ActualizarAutomaticamente(int id, [FromBody] JsonElement changes)
        {
            try
            {
                // Buscar producto en la base de datos
                var product = await _context.Product.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { success = false, message = "No se encontro el producto para actualizar automaticamente." });
                }

                // Actualizacion de campos solo si existen en el JSON y son validos
                if (changes.TryGetProperty("name", out JsonElement name) && !string.IsNullOrWhiteSpace(name.GetString()))
                {
                    product.name = name.GetString();
                }

                if (changes.TryGetProperty("category", out JsonElement category) && !string.IsNullOrWhiteSpace(category.GetString()))
                {
                    product.category = category.GetString();
                }

                if (changes.TryGetProperty("price", out JsonElement price) && price.TryGetDecimal(out decimal priceValue) && priceValue > 0)
                {
                    product.price = priceValue;
                }

                if (changes.TryGetProperty("stock", out JsonElement stock) && stock.TryGetInt32(out int stockValue) && stockValue >= 0)
                {
                    product.stock = stockValue;
                }

                // Guardar cambios
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Producto actualizado automaticamente.",
                    data = product
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en actualizacion automatica: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrio un error en la actualizacion automatica.",
                    error = ex.Message
                });
            }
        }


        [HttpDelete]   /* Hecho por: Rubby Keyther Martinez Z.  3-11-2025  5:51am */
        [Route("eliminarProducto/{id}")]
        public async Task<IActionResult> EliminarProducto(int id)
        {
            try
            {
                // Validar que el ID sea válido
                if (id <= 0)
                {
                    return BadRequest(new { success = false, message = "El ID del producto no es válido." });
                }

                // Buscar el producto en la base de datos
                var product = await _context.Product.FindAsync(id);

                // Verificar si el producto existe
                if (product == null)
                {
                    return NotFound(new { success = false, message = "El producto no existe." });
                }

                // Eliminar el producto
                _context.Product.Remove(product);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Producto eliminado correctamente.",
                    data = product
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar el producto: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrió un error al eliminar el producto.",
                    error = ex.Message
                });
            }
        }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }
}
