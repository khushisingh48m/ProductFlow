import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  status: string;
  created_at?: string;
};

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ================================
  // FETCH PRODUCTS
  // ================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load products");
      }

      const data = await response.json();

      // Backend may return products directly
      // or inside a products property.
      setProducts(data.products || data);
    } catch (error) {
      console.error("Fetch products error:", error);
      setError("Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOAD PRODUCTS
  // ================================
  useEffect(() => {
    fetchProducts();
  }, []);

  // ================================
  // DELETE PRODUCT
  // ================================
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete product");
      }

      // Remove deleted product from current list
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Unable to delete product");
    }
  };

  // ================================
  // UPDATE PRODUCT
  // ================================
  const handleEdit = async (product: Product) => {
    const newName = window.prompt(
      "Enter new product name:",
      product.name
    );

    if (newName === null) {
      return;
    }

    const newPrice = window.prompt(
      "Enter new price:",
      String(product.price)
    );

    if (newPrice === null) {
      return;
    }

    const priceNumber = Number(newPrice);

    if (Number.isNaN(priceNumber)) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newName,
            description: product.description,
            price: priceNumber,
            status: product.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update product");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Update product error:", error);
      setError("Unable to update product");
    }
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="product-list">
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  // ================================
  // UI
  // ================================
  return (
    <div className="product-list">

      <div className="product-list-header">
        <h2>Your Products</h2>

        <button
          type="button"
          onClick={fetchProducts}
        >
          Refresh Products
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="products-container">

          {products.map((product) => (
            <div
              className="product-card"
              key={product.id}
            >

              <div className="product-info">

                <h3>
                  {product.name}
                </h3>

                <p>
                  {product.description}
                </p>

                <p>
                  <strong>Price:</strong>{" "}
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {product.status}
                </p>

              </div>

              <div className="product-actions">

                <button
                  type="button"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default ProductList;