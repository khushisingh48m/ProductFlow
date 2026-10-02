import { useEffect, useState } from "react";
import Login from "./Login";
import AddProduct from "./AddProductForm";
import ProductList from "./ProductList";
import "./App.css";

type Stats = {
  total_products: string;
  active_products: string;
  inactive_products: string;
  total_value: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FETCH USER DETAILS
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/auth/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("User fetch error:", error);
    }
  };

  // FETCH DASHBOARD STATS
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/products/dashboard/stats",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          return;
        }

        throw new Error(
          data.message || "Failed to fetch dashboard"
        );
      }

      setStats(data.stats);
    } catch (error) {
      console.error(error);
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUser();
      fetchDashboardStats();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setStats(null);
    setUser(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">

        <div className="brand-section">
          <div className="brand-logo">
            PF
          </div>

          <div>
            <h1>ProductFlow</h1>

            <p>
              Product Management Dashboard
            </p>
          </div>
        </div>

        <div className="header-actions">

          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <span className="welcome-text">
                  Welcome back
                </span>

                <strong>
                  {user.name}
                </strong>
              </div>
            </div>
          )}

          <button onClick={fetchDashboardStats}>
            Refresh
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>
      </header>


      {/* MAIN */}
      <main>

        <div className="dashboard-title">
          <div>
            <h2>Dashboard Overview</h2>

            <p>
              Track and manage your products from one place.
            </p>
          </div>
        </div>


        {/* STATS */}
        {!loading && !error && stats && (
          <div className="stats-grid">

            <div className="stat-card">
              <span className="stat-label">
                Total Products
              </span>

              <h3>
                {stats.total_products}
              </h3>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Active Products
              </span>

              <h3>
                {stats.active_products}
              </h3>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Inactive Products
              </span>

              <h3>
                {stats.inactive_products}
              </h3>
            </div>


            <div className="stat-card">
              <span className="stat-label">
                Total Value
              </span>

              <h3>
                ₹
                {Number(
                  stats.total_value
                ).toLocaleString("en-IN")}
              </h3>
            </div>

          </div>
        )}


        {/* ADD PRODUCT */}
        <AddProduct
          onProductAdded={fetchDashboardStats}
        />


        {/* PRODUCTS */}
        <ProductList />


        {loading && (
          <p className="loading-message">
            Loading dashboard...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </main>

    </div>
  );
}

export default App;