import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  status: string;
  created_at: string;
};

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch products");
        return;
      }

      setProducts(data.products);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE PRODUCT
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
       "${import.meta.env.VITE_API_URL}/api/products/${id}",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete product");
        return;
      }

      alert("Product deleted successfully!");

      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };

  // UPDATE PRODUCT
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            price: Number(editingProduct.price),
            status: editingProduct.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update product");
        return;
      }

      alert("Product updated successfully!");

      setEditingProduct(null);

      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };

  if (loading) {
    return (
      <div className="product-loading">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="product-list">
      <div className="section-heading">
        <div>
          <h2>My Products</h2>
          <p>Manage all your products from here.</p>
        </div>

        <span className="product-count">
          {products.length}{" "}
          {products.length === 1 ? "Product" : "Products"}
        </span>
      </div>

      {/* EDIT FORM */}
      {editingProduct && (
        <div className="edit-product">
          <div className="edit-header">
            <div>
              <h3>Edit Product</h3>
              <p>Update the details of your product.</p>
            </div>

            <button
              type="button"
              className="close-edit"
              onClick={() => setEditingProduct(null)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="edit-field">
              <label>Product Name</label>

              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name: e.target.value,
                  })
                }
                placeholder="Product name"
                required
              />
            </div>

            <div className="edit-field">
              <label>Description</label>

              <textarea
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                placeholder="Product description"
              />
            </div>

            <div className="edit-field">
              <label>Price</label>

              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: e.target.value,
                  })
                }
                placeholder="Price"
                required
              />
            </div>

            <div className="edit-field">
              <label>Status</label>

              <select
                value={editingProduct.status}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    status: e.target.value,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="edit-buttons">
              <button type="submit" className="save-button">
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT LIST */}
      {products.length === 0 ? (
        <div className="empty-products">
          <div className="empty-icon">📦</div>

          <h3>No products yet</h3>

          <p>
            Add your first product using the form above.
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-card-top">
                <div className="product-icon">
                  {product.name.charAt(0).toUpperCase()}
                </div>

                <span
                  className={`status-badge ${
                    product.status === "active"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-description">
                  {product.description ||
                    "No description available."}
                </p>
              </div>

              <div className="product-price">
                <span>Price</span>

                <strong>
                  ₹
                  {Number(product.price).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="product-card-footer">
                <button
                  className="edit-button"
                  onClick={() =>
                    setEditingProduct(product)
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDelete(product.id)
                  }
                >
                  🗑️ Delete
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