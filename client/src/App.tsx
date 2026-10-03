import { useEffect, useState } from "react";
import AddProduct from "./AddProductForm";
import ProductList from "./ProductList";
import Login from "./Login";
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
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    total_products: 0,
    active_products: 0,
    total_value: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        setUser(null);
        setIsLoggedIn(false);
        return false;
      }

      const data = await response.json();

      setUser(data.user);

      return true;
    } catch (error) {
      console.error("User fetch error:", error);
      setError("Unable to connect to server");
      return false;
    }
  };

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
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

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const validUser = await fetchUser();

    if (validUser) {
      await fetchDashboardStats();
    }

    setLoading(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);

    setStats({
      total_products: 0,
      active_products: 0,
      total_value: 0,
    });

    setError("");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboard();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          Loading ProductFlow...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

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
            onClick={loadDashboard}
          >
            Refresh
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard">

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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="product-section">

          <AddProduct
            onProductAdded={loadDashboard}
          />

        </section>

        <section className="product-section">

          <ProductList />

        </section>

      </main>

    </div>
  );
}

export default App;