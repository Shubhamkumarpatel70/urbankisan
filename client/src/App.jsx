import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import DashboardLayout from "./components/DashboardLayout";
import LoadingOverlay from "./components/LoadingOverlay";
import NoInternet from "./components/NoInternet";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DashboardRedirect from "./pages/DashboardRedirect";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminContactQueries from "./pages/admin/AdminContactQueries";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminVotes from "./pages/admin/AdminVotes";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminPaymentMethods from "./pages/admin/AdminPaymentMethods";
import UserDashboard from "./pages/user/UserDashboard";
import UserOrders from "./pages/user/UserOrders";
import UserSettings from "./pages/user/UserSettings";
import NotFound from "./pages/NotFound";

function App() {
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initial page load detection
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    // If page loads faster, clear immediately
    if (document.readyState === "complete") {
      setInitialLoading(false);
      clearTimeout(timer);
    } else {
      const handleLoad = () => {
        setInitialLoading(false);
        clearTimeout(timer);
      };
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timer);
      };
    }
  }, []);

  // Slow network detection
  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const checkConnection = () => {
      if (connection) {
        // Detect slow network (2g, slow-2g, or effectiveType slow)
        const slowTypes = ["slow-2g", "2g"];
        const isSlow = slowTypes.includes(connection.effectiveType) || 
                       (connection.downlink && connection.downlink < 0.5);
        setIsSlowNetwork(isSlow);
      }
    };

    checkConnection();
    
    if (connection) {
      connection.addEventListener("change", checkConnection);
      return () => connection.removeEventListener("change", checkConnection);
    }
  }, []);

  // Tab visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsTabLoading(true);
        setTimeout(() => setIsTabLoading(false), 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Internet connection detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetryConnection = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      window.location.reload();
    }
  };

  // Show no internet page if offline
  if (!isOnline) {
    return <NoInternet onRetry={handleRetryConnection} />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <ToastProvider>
              <Router>
                <LoadingOverlay show={isTabLoading || initialLoading} />
                {/* Slow Network Banner */}
                {isSlowNetwork && !initialLoading && (
                  <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white text-center py-2 text-sm font-medium">
                    ⚠️ Slow network detected. Some features may take longer to load.
                  </div>
                )}
                <Routes>
                  {/* Dashboard routes — no Navbar/Footer, uses DashboardLayout sidebar */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardRedirect />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route
                      path="orders"
                      element={<DashboardRedirect type="orders" />}
                    />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="shipping" element={<AdminShipping />} />
                    <Route path="payments" element={<AdminPaymentMethods />} />
                    <Route
                      path="notifications"
                      element={<AdminNotifications />}
                    />
                    <Route
                      path="contact-queries"
                      element={<AdminContactQueries />}
                    />
                    <Route path="newsletter" element={<AdminNewsletter />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="votes" element={<AdminVotes />} />
                    <Route path="team" element={<AdminTeam />} />
                    <Route path="settings" element={<UserSettings />} />
                  </Route>

                  {/* Main store routes — with Navbar/Footer */}
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex flex-col bg-ivory">
                        <Navbar />
                        <main className="flex-grow">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route
                              path="/product/:id"
                              element={<ProductDetail />}
                            />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route
                              path="/order-confirmation/:id"
                              element={<OrderConfirmation />}
                            />
                            <Route
                              path="/track-order"
                              element={<OrderTracking />}
                            />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                        <Footer />
                        <ScrollToTop />
                      </div>
                    }
                  />
                </Routes>
              </Router>
            </ToastProvider>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
