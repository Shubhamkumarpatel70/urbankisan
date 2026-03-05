import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiPackage,
  FiHome,
  FiLogOut,
  FiChevronLeft,
  FiShield,
} from "react-icons/fi";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user from localStorage (would normally come from AuthContext)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = !!user.isAdmin;

  const menuItems = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard", icon: FiGrid },
        { to: "/dashboard/products", label: "Products", icon: FiPackage },
        { to: "/dashboard/orders", label: "Orders", icon: FiPackage },
        { to: "/dashboard/customers", label: "Customers", icon: FiGrid },
        {
          to: "/dashboard/notifications",
          label: "Notifications",
          icon: FiGrid,
        },
        { to: "/dashboard/feedback", label: "Feedback", icon: FiGrid },
        { to: "/dashboard/coupons", label: "Coupons", icon: FiGrid },
        { to: "/dashboard/team", label: "Team", icon: FiGrid },
        { to: "/dashboard/newsletter", label: "Newsletter", icon: FiGrid },
        { to: "/dashboard/votes", label: "Votes", icon: FiGrid },
        { to: "/dashboard/shipping", label: "Shipping", icon: FiGrid },
        {
          to: "/dashboard/payments",
          label: "Payment Methods",
          icon: FiGrid,
        },
        { to: "/dashboard/site-images", label: "Site Images", icon: FiGrid },
        { to: "/dashboard/testimonials", label: "Testimonials", icon: FiGrid },
        {
          to: "/dashboard/contact-queries",
          label: "Contact Queries",
          icon: FiGrid,
        },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", icon: FiGrid },
        { to: "/dashboard/orders", label: "My Orders", icon: FiPackage },
        { to: "/dashboard/settings", label: "Settings", icon: FiGrid },
      ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user || !user._id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive mx-auto mb-4"></div>
          <p className="text-brown">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen bg-cream overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-wheat border-r border-wheat transition-all duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${collapsed ? "w-16" : "w-64"}`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-wheat flex items-center justify-between flex-shrink-0">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdmin ? "bg-gold" : "bg-olive"}`}
                >
                  <span className="text-ivory font-bold text-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-brown text-sm truncate">
                    {user.name || "User"}
                  </p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isAdmin
                        ? "bg-gold/20 text-gold"
                        : "bg-olive/10 text-olive"
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
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
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
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
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
    </>
  );
};

export default DashboardLayout;
