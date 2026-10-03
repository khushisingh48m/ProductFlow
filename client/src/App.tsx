import { useEffect, useState } from "react";
import AddProduct from "./AddProductForm";
import ProductList from "./ProductList";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

type User = {
  id: number;
  name: string;
  email: string;
};

type DashboardStats = {
  total_products: number;
  active_products: number;
  total_value: number;
};

function App() {
  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    total_products: 0,
    active_products: 0,
    total_value: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ================================
  // FETCH CURRENT USER
  // ================================
  const fetchUser = async () => {
    try {
      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to connect to server");
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      console.error("User fetch error:", error);
      setError("Unable to connect to server");
    }
  };

  // ================================
  // FETCH DASHBOARD STATS
  // ================================
  const fetchDashboardStats = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/products/dashboard/stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load dashboard data");
      }

      const data = await response.json();

      setStats({
        total_products: Number(data.total_products || 0),
        active_products: Number(data.active_products || 0),
        total_value: Number(data.total_value || 0),
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      setError("Unable to load dashboard data");
    }
  };

  // ================================
  // LOAD DASHBOARD
  // ================================
  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      fetchUser(),
      fetchDashboardStats(),
    ]);

    setLoading(false);
  };

  // ================================
  // LOAD ON PAGE OPEN
  // ================================
  useEffect(() => {
    loadDashboard();
  }, []);

  // ================================
  // LOGOUT
  // ================================
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ================================
  // REFRESH
  // ================================
  const handleRefresh = () => {
    loadDashboard();
  };

  // ================================
  // LOADING SCREEN
  // ================================
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          Loading ProductFlow...
        </div>
      </div>
    );
  }

  // ================================
  // DASHBOARD
  // ================================
  return (
    <div className="app-container">

      {/* ================= HEADER ================= */}
      <header className="app-header">

        <div className="brand-section">

          <div className="logo">
            PF
          </div>

          <div>
            <h1>ProductFlow</h1>
            <p>Product Management Dashboard</p>
          </div>

        </div>

        <div className="header-actions">

          <button
            className="refresh-button"
            onClick={handleRefresh}
          >
            Refresh
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ================= MAIN ================= */}
      <main className="dashboard">

        {/* ================= WELCOME ================= */}
        <section className="welcome-section">

          <h2>
            Dashboard Overview
          </h2>

          <p>
            Track and manage your products from one place.
          </p>

          {user && (
            <p className="welcome-user">
              Welcome, {user.name} 👋
            </p>
          )}

        </section>

        {/* ================= STATS ================= */}
        <section className="stats-container">

          <div className="stat-card">
            <h3>Total Products</h3>

            <p>
              {stats.total_products}
            </p>
          </div>

          <div className="stat-card">
            <h3>Active Products</h3>

            <p>
              {stats.active_products}
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Value</h3>

            <p>
              ₹{stats.total_value.toLocaleString("en-IN")}
            </p>
          </div>

        </section>

        {/* ================= ERROR ================= */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ================= ADD PRODUCT ================= */}
        <section className="product-section">

          <AddProduct
            onProductAdded={handleRefresh}
          />

        </section>

        {/* ================= PRODUCT LIST ================= */}
        <section className="product-section">

          <ProductList />

        </section>

      </main>

    </div>
  );
}

export default App;