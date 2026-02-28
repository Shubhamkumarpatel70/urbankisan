import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiHeart,
  FiTruck,
  FiChevronLeft,
  FiLogOut,
  FiHome,
  FiShield,
  FiTag,
  FiBell,
  FiMessageCircle,
  FiMail,
  FiStar,
  FiThumbsUp,
  FiCreditCard,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin;

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = sidebarOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const adminMenuItems = [
    { icon: FiGrid, label: "Dashboard", to: "/dashboard" },
    { icon: FiShoppingBag, label: "Products", to: "/dashboard/products" },
    { icon: FiPackage, label: "Orders", to: "/dashboard/orders" },
    { icon: FiUsers, label: "Customers", to: "/dashboard/customers" },
    { icon: FiTag, label: "Coupons", to: "/dashboard/coupons" },
    { icon: FiTruck, label: "Shipping", to: "/dashboard/shipping" },
    { icon: FiCreditCard, label: "Payments", to: "/dashboard/payments" },
    { icon: FiBell, label: "Notifications", to: "/dashboard/notifications" },
    {
      icon: FiMessageCircle,
      label: "Contact Queries",
      to: "/dashboard/contact-queries",
    },
    { icon: FiMail, label: "Newsletter", to: "/dashboard/newsletter" },
    { icon: FiStar, label: "Feedback", to: "/dashboard/feedback" },
    { icon: FiThumbsUp, label: "Votes", to: "/dashboard/votes" },
    { icon: FiUsers, label: "Team", to: "/dashboard/team" },
    { icon: FiSettings, label: "Settings", to: "/dashboard/settings" },
  ];

  const userMenuItems = [
    { icon: FiGrid, label: "Dashboard", to: "/dashboard" },
    { icon: FiPackage, label: "My Orders", to: "/dashboard/orders" },
    { icon: FiHeart, label: "Wishlist", to: "/wishlist" },
    { icon: FiTruck, label: "Track Order", to: "/track-order" },
    { icon: FiSettings, label: "Settings", to: "/dashboard/settings" },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] overflow-hidden bg-ivory">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          bg-white border-r border-wheat shadow-lg lg:shadow-none
          transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          w-72
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-wheat flex items-center justify-between flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdmin ? "bg-gold" : "bg-olive"}`}
              >
                <span className="text-ivory font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-brown text-sm truncate">
                  {user.name}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isAdmin ? "bg-gold/20 text-gold" : "bg-olive/10 text-olive"
                  }`}
                >
                  {isAdmin ? "Admin" : "User"}
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${isAdmin ? "bg-gold" : "bg-olive"}`}
            >
              <span className="text-ivory font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Close on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brown/60 hover:text-brown p-1"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : ""}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? isAdmin
                      ? "bg-gold text-brown font-medium shadow-sm"
                      : "bg-olive text-ivory font-medium shadow-sm"
                    : "text-brown/70 hover:bg-wheat/60 hover:text-brown"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-wheat space-y-1 flex-shrink-0">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-brown/70 hover:bg-wheat/60 hover:text-brown transition-colors ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Back to Store" : ""}
          >
            <FiHome size={20} />
            {!collapsed && <span className="text-sm">Back to Store</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/80 hover:bg-red-50 hover:text-red-500 transition-colors ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Logout" : ""}
          >
            <FiLogOut size={20} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>

          {/* Collapse Toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-brown/40 hover:bg-wheat/60 hover:text-brown transition-all ${collapsed ? "justify-center" : ""}`}
          >
            <FiChevronLeft
              size={18}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-wheat px-4 sm:px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-brown p-1"
          >
            <FiMenu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-bold text-brown truncate">
              {isAdmin ? "Admin Panel" : "My Account"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs bg-gold/20 text-gold px-3 py-1.5 rounded-full font-bold">
                <FiShield size={12} /> Admin
              </span>
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? "bg-gold" : "bg-olive"}`}
            >
              <span className="text-ivory text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
