import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiHeart,
  FiPackage,
  FiLogOut,
  FiChevronDown,
  FiGrid,
  FiShield,
  FiBell,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import logo from "../../../logo/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { getWishlistCount } = useWishlist();
  const location = useLocation();
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const productsRef = useRef(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Poll unread count every 15s
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = async () => {
      try {
        const { data } = await axios.get("/api/notifications/unread-count");
        setUnreadCount(data.unreadCount);
      } catch (e) {
        /* ignore */
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotifications = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      setNotifLoading(true);
      try {
        const { data } = await axios.get("/api/notifications");
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (e) {
        /* ignore */
      }
      setNotifLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      /* ignore */
    }
  };

  const markRead = async (id, e) => {
    if (e) e.stopPropagation();
    // Optimistically update UI first
    const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
    if (wasUnread) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    try {
      await axios.put(`/api/notifications/${id}/read`);
    } catch (e) {
      // Revert on error
      if (wasUnread) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)),
        );
        setUnreadCount((c) => c + 1);
      }
      console.error("Failed to mark notification as read:", e);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (productsRef.current && !productsRef.current.contains(e.target)) {
        setShowProductsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const productFilters = [
    { to: "/products", label: "All Products" },
    { to: "/products?category=organic", label: "Organic" },
    { to: "/products?category=spices", label: "Spices" },
    { to: "/products?category=grains", label: "Grains" },
    { to: "/products?category=dairy", label: "Dairy" },
  ];

  return (
    <>
      <nav className="bg-ivory/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-wheat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src={logo}
                alt="UrbanKisan"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-brown hover:text-olive transition-colors font-medium ${
                    location.pathname === link.to ? "text-olive" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Products Link */}
              <Link
                to="/products"
                className={`text-brown hover:text-olive transition-colors font-medium ${
                  location.pathname === "/products" || location.pathname.startsWith("/product") ? "text-olive" : ""
                }`}
              >
                Products
              </Link>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-5">
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative text-brown hover:text-olive transition-colors"
                title="Wishlist"
              >
                <FiHeart size={22} />
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>

              {/* Notifications Bell */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={openNotifications}
                    className="relative text-brown hover:text-olive transition-colors"
                    title="Notifications"
                  >
                    <FiBell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-xl border border-wheat z-50 animate-fadeIn overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-wheat">
                        <h3 className="font-display font-semibold text-brown text-sm">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-olive hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto no-scrollbar">
                        {notifLoading ? (
                          <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="h-12 bg-wheat/30 rounded-lg animate-pulse"
                              />
                            ))}
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <FiBell
                              className="mx-auto text-brown/20 mb-2"
                              size={24}
                            />
                            <p className="text-xs text-brown/40">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          notifications.slice(0, 15).map((n) => (
                            <div
                              key={n._id}
                              onClick={(e) => markRead(n._id, e)}
                              className={`px-4 py-3 border-b border-wheat/50 cursor-pointer hover:bg-ivory transition-all duration-200 ${!n.isRead ? "bg-olive/5" : ""}`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-colors duration-200 ${!n.isRead ? "bg-olive" : "bg-transparent"}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-brown leading-tight">
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-brown/50 mt-0.5 line-clamp-1">
                                    {n.message}
                                  </p>
                                  <p className="text-[10px] text-brown/30 mt-1">
                                    {timeAgo(n.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative text-brown hover:text-olive transition-colors"
                title="Cart"
              >
                <FiShoppingCart size={22} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-brown text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* Profile / Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-brown hover:text-olive transition-colors"
                  >
                    <div className="w-8 h-8 bg-olive rounded-full flex items-center justify-center">
                      <span className="text-ivory text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-sm hidden lg:block">
                      {user.name.split(" ")[0]}
                    </span>
                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-wheat py-2 animate-scaleIn origin-top-right">
                      <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-ivory transition-colors ${
                          user.isAdmin ? "text-gold" : "text-olive"
                        }`}
                      >
                        {user.isAdmin ? (
                          <FiShield size={16} />
                        ) : (
                          <FiGrid size={16} />
                        )}
                        {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                      </Link>
                      <div className="border-t border-wheat my-1" />
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-brown hover:bg-ivory transition-colors"
                      >
                        <FiUser size={16} /> My Profile
                      </Link>
                      <Link
                        to="/dashboard/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-brown hover:bg-ivory transition-colors"
                      >
                        <FiPackage size={16} /> My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-brown hover:bg-ivory transition-colors"
                      >
                        <FiHeart size={16} /> My Wishlist
                      </Link>
                      <Link
                        to="/track-order"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-brown hover:bg-ivory transition-colors"
                      >
                        <FiPackage size={16} /> Track Order
                      </Link>
                      <div className="border-t border-wheat my-1" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-brown hover:text-olive transition-colors"
                >
                  <FiUser size={22} />
                  <span className="font-medium text-sm">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Right Side */}
            <div className="flex md:hidden items-center space-x-3">
              <Link to="/wishlist" className="relative text-brown">
                <FiHeart size={20} />
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={openNotifications}
                    className="relative text-brown"
                  >
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifs && (
                    <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-72 bg-white rounded-xl shadow-xl border border-wheat z-[80] animate-fadeIn overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-wheat">
                        <h3 className="font-display font-semibold text-brown text-sm">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-olive hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto no-scrollbar">
                        {notifLoading ? (
                          <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="h-12 bg-wheat/30 rounded-lg animate-pulse"
                              />
                            ))}
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <FiBell
                              className="mx-auto text-brown/20 mb-2"
                              size={24}
                            />
                            <p className="text-xs text-brown/40">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => !n.isRead && markRead(n._id)}
                              className={`px-4 py-3 border-b border-wheat/50 cursor-pointer hover:bg-ivory transition-colors ${!n.isRead ? "bg-olive/5" : ""}`}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-olive" : "bg-transparent"}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-brown leading-tight">
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-brown/50 mt-0.5 line-clamp-1">
                                    {n.message}
                                  </p>
                                  <p className="text-[10px] text-brown/30 mt-1">
                                    {timeAgo(n.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Link to="/cart" className="relative text-brown">
                <FiShoppingCart size={20} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold text-brown text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button
                className="text-brown"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer — outside nav for proper z-index stacking */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[280px] bg-ivory z-[70] shadow-2xl md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-wheat">
              <span className="font-display text-lg font-bold text-brown">
                Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-brown p-1"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4 space-y-1 overflow-y-auto h-[calc(100%-64px)]">
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 bg-olive/10 rounded-xl mb-4">
                  <div className="w-10 h-10 bg-olive rounded-full flex items-center justify-center">
                    <span className="text-ivory font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-brown text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-brown/60">{user.email}</p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block px-3 py-3 text-brown hover:text-olive hover:bg-wheat/50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Products Dropdown */}
              <div>
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="flex items-center justify-between w-full px-3 py-3 text-brown hover:text-olive hover:bg-wheat/50 rounded-lg transition-colors font-medium"
                >
                  <span>Products</span>
                  <FiChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileProductsOpen && (
                  <div className="ml-3 pl-3 border-l-2 border-wheat space-y-1 mt-1">
                    {productFilters.map((filter) => (
                      <Link
                        key={filter.label}
                        to={filter.to}
                        className="block px-3 py-2.5 text-sm text-brown/80 hover:text-olive hover:bg-wheat/30 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {filter.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-wheat my-3" />

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium ${user.isAdmin ? "text-gold hover:bg-gold/10" : "text-olive hover:bg-olive/10"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {user.isAdmin ? <FiShield size={18} /> : <FiGrid size={18} />}
                  <span>
                    {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                  </span>
                </Link>
              )}

              <div className="border-t border-wheat my-3" />

              <Link
                to="/wishlist"
                className="flex items-center gap-3 px-3 py-3 text-brown hover:text-olive hover:bg-wheat/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FiHeart size={18} />
                <span className="font-medium">Wishlist</span>
                {getWishlistCount() > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="flex items-center gap-3 px-3 py-3 text-brown hover:text-olive hover:bg-wheat/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FiShoppingCart size={18} />
                <span className="font-medium">Cart</span>
                {getCartCount() > 0 && (
                  <span className="ml-auto bg-gold text-brown text-xs rounded-full px-2 py-0.5">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              <Link
                to="/track-order"
                className="flex items-center gap-3 px-3 py-3 text-brown hover:text-olive hover:bg-wheat/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FiPackage size={18} />
                <span className="font-medium">Track Order</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-3 text-brown hover:text-olive hover:bg-wheat/50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FiUser size={18} />
                  <span className="font-medium">My Profile</span>
                </Link>
              )}

              <div className="border-t border-wheat my-3" />

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <FiLogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center btn-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
