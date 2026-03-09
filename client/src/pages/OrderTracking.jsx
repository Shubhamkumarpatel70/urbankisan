import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FiSearch,
  FiCheck,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiNavigation,
  FiLock,
  FiLogIn,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const steps = [
  { key: "confirmed", label: "Confirmed", icon: FiCheck },
  { key: "processing", label: "Processing", icon: FiPackage },
  { key: "shipped", label: "Shipped", icon: FiTruck },
  { key: "outForDelivery", label: "Out for Delivery", icon: FiNavigation },
  { key: "delivered", label: "Delivered", icon: FiMapPin },
];

const getStepIndex = (status) => {
  const idx = steps.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animatedStep, setAnimatedStep] = useState(-1);
  const animationRef = useRef(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("id")) {
      handleSearch(searchParams.get("id"));
    }
  }, []);

  // Fetch recent orders for logged-in user
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!isAuthenticated || !user?.token) {
        setRecentOrders([]);
        return;
      }
      setRecentOrdersLoading(true);
      try {
        const { data } = await axios.get("/api/orders/myorders", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        // Get only the 5 most recent orders
        setRecentOrders(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setRecentOrdersLoading(false);
      }
    };
    fetchRecentOrders();
  }, [isAuthenticated, user]);

  // Sequentially animate steps when order loads
  useEffect(() => {
    if (!order || order.orderStatus === "cancelled") return;

    const target = getStepIndex(order.orderStatus);
    setAnimatedStep(-1);

    // Clear any previous animation
    if (animationRef.current) clearInterval(animationRef.current);

    let step = -1;
    // Small initial delay, then animate each step
    const timer = setTimeout(() => {
      animationRef.current = setInterval(() => {
        step++;
        setAnimatedStep(step);
        if (step >= target) {
          clearInterval(animationRef.current);
        }
      }, 500);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [order]);

  const handleSearch = async (id) => {
    const searchId = id || orderId;
    if (!searchId.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setIsOwner(false);
    setAnimatedStep(-1);

    try {
      const { data } = await axios.get(`/api/orders/track/${searchId.trim()}`);
      setOrder(data);
      setIsOwner(data.isOwner || false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Order not found. Please check the ID and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;
  const displayId = order?.orderId || order?._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-6 text-center">
        Track Your Order 📦
      </h1>

      {/* Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
              size={16}
            />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter Order ID (e.g. UK-2602-0001)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-wheat text-sm text-brown placeholder-brown/40 focus:outline-none focus:border-olive font-mono"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 bg-olive text-ivory rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* Recent Orders Section - Only visible before searching */}
      {!order && !loading && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
          <h2 className="font-display font-semibold text-brown mb-4 flex items-center gap-2">
            <FiPackage className="text-olive" size={18} />
            Your Recent Orders
          </h2>

          {isAuthenticated ? (
            recentOrdersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-wheat/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((recentOrder) => {
                  const statusEmoji =
                    recentOrder.orderStatus === "delivered"
                      ? "✅"
                      : recentOrder.orderStatus === "cancelled"
                        ? "❌"
                        : recentOrder.orderStatus === "shipped"
                          ? "📦"
                          : recentOrder.orderStatus === "outForDelivery"
                            ? "🚚"
                            : recentOrder.orderStatus === "processing"
                              ? "⚙️"
                              : "✓";

                  return (
                    <button
                      key={recentOrder._id}
                      onClick={() => {
                        const id = recentOrder.orderId || recentOrder._id;
                        setOrderId(id);
                        handleSearch(id);
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-ivory hover:bg-wheat/50 rounded-xl transition-all text-left group border border-transparent hover:border-olive/20"
                    >
                      {/* Order Image Stack */}
                      <div className="relative w-14 h-14 flex-shrink-0">
                        {recentOrder.items?.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className={`absolute w-11 h-11 bg-wheat rounded-lg overflow-hidden border-2 border-white shadow-sm ${
                              idx === 0
                                ? "z-10 top-0 left-0"
                                : "z-0 bottom-0 right-0"
                            }`}
                          >
                            {item?.image ? (
                              <img
                                src={item.image}
                                alt={item.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage
                                  className="text-brown/30"
                                  size={16}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {recentOrder.items?.length > 2 && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-olive text-ivory text-[10px] font-bold rounded-full flex items-center justify-center z-20">
                            +{recentOrder.items.length - 2}
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-mono text-sm font-semibold text-olive">
                            {recentOrder.orderId || recentOrder._id?.slice(-8)}
                          </p>
                          <span className="text-sm">{statusEmoji}</span>
                        </div>
                        <p className="text-sm text-brown font-medium truncate">
                          {recentOrder.items?.length === 1
                            ? recentOrder.items[0]?.name || "Product"
                            : recentOrder.items?.length > 1
                              ? `${recentOrder.items[0]?.name || "Product"} +${recentOrder.items.length - 1} more`
                              : "Order"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-brown/60 mt-0.5">
                          <span>
                            {new Date(recentOrder.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-brown">
                            ₹{recentOrder.totalPrice}
                          </span>
                          <span>•</span>
                          <span>
                            {recentOrder.items?.length || 0} item
                            {recentOrder.items?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            recentOrder.orderStatus === "delivered"
                              ? "bg-green-100 text-green-700"
                              : recentOrder.orderStatus === "cancelled"
                                ? "bg-red-100 text-red-600"
                                : recentOrder.orderStatus === "shipped" ||
                                    recentOrder.orderStatus === "outForDelivery"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-olive/10 text-olive"
                          }`}
                        >
                          {recentOrder.orderStatus === "outForDelivery"
                            ? "On the way"
                            : recentOrder.orderStatus.charAt(0).toUpperCase() +
                              recentOrder.orderStatus.slice(1)}
                        </span>
                        <p className="text-[10px] text-brown/40 mt-1 group-hover:text-olive transition-colors">
                          Tap to track →
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* View All Link */}
                <Link
                  to="/user/orders"
                  className="block text-center text-sm text-olive hover:underline pt-2"
                >
                  View All Orders →
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <FiPackage className="mx-auto text-brown/20 mb-3" size={32} />
                <p className="text-brown/50 text-sm">No orders yet</p>
                <Link
                  to="/products"
                  className="inline-block mt-3 text-sm text-olive hover:underline"
                >
                  Start Shopping →
                </Link>
              </div>
            )
          ) : (
            /* Not logged in */
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-wheat rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="text-brown/40" size={24} />
              </div>
              <p className="text-brown/70 font-medium mb-2">
                Login to view your orders
              </p>
              <p className="text-brown/50 text-sm mb-4">
                Access your order history and track all orders easily
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-olive text-ivory rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors"
              >
                <FiLogIn size={16} /> Login
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm animate-fadeIn">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
            <div>
              <p className="text-xs text-brown/50">Order ID</p>
              <p className="text-lg font-mono font-bold text-olive">
                {displayId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-brown/50">Order Date</p>
              <p className="text-sm text-brown">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="flex justify-center mb-8">
            <div
              className={`px-6 py-3 rounded-2xl text-center ${
                order.orderStatus === "cancelled"
                  ? "bg-red-50 border-2 border-red-200"
                  : order.orderStatus === "delivered"
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-olive/10 border-2 border-olive/20"
              }`}
            >
              <p className="text-xs text-brown/60 mb-1">Current Status</p>
              <p
                className={`text-lg font-bold ${
                  order.orderStatus === "cancelled"
                    ? "text-red-600"
                    : order.orderStatus === "delivered"
                      ? "text-green-600"
                      : "text-olive"
                }`}
              >
                {order.orderStatus === "cancelled"
                  ? "❌ Cancelled"
                  : order.orderStatus === "delivered"
                    ? "✅ Delivered"
                    : order.orderStatus === "outForDelivery"
                      ? "🚚 Out for Delivery"
                      : order.orderStatus === "shipped"
                        ? "📦 Shipped"
                        : order.orderStatus === "processing"
                          ? "⚙️ Processing"
                          : "✓ Confirmed"}
              </p>
            </div>
          </div>

          {/* Cancelled State */}
          {order.orderStatus === "cancelled" ? (
            <div className="text-center py-6 mb-8 border-2 border-red-100 rounded-xl bg-red-50/50">
              <span className="text-3xl mb-2 block">❌</span>
              <p className="text-red-600 font-semibold">
                This order has been cancelled
              </p>
              {order.cancelReason && (
                <div className="mt-4 mx-auto max-w-md">
                  <p className="text-sm text-brown/60 mb-1">Reason</p>
                  <p className="text-sm text-red-500 bg-white px-4 py-2 rounded-lg inline-block">
                    {order.cancelReason}
                  </p>
                </div>
              )}
              {/* Refund Status */}
              {order.paymentMethod !== "COD" &&
                order.paymentMethod !== "Cash on Delivery" &&
                order.refundStatus && (
                  <div
                    className={`mt-4 mx-auto max-w-md px-4 py-3 rounded-lg ${
                      order.refundStatus === "completed"
                        ? "bg-green-50"
                        : "bg-orange-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        order.refundStatus === "completed"
                          ? "text-green-700"
                          : "text-orange-700"
                      }`}
                    >
                      {order.refundStatus === "completed"
                        ? "💰 Refund Completed"
                        : "⏳ Refund Pending"}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        order.refundStatus === "completed"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {order.refundStatus === "completed"
                        ? `₹${order.totalPrice} has been refunded`
                        : `₹${order.totalPrice} will be refunded within 5-7 business days`}
                    </p>
                    {order.refundStatus === "completed" &&
                      order.refundUtrNumber && (
                        <p className="text-xs text-green-600 font-mono mt-1">
                          UTR: {order.refundUtrNumber}
                        </p>
                      )}
                  </div>
                )}
            </div>
          ) : (
            <>
              {/* Desktop Horizontal Stepper — animated */}
              <div className="hidden sm:flex items-center justify-between mb-10 px-2">
                {steps.map((step, idx) => {
                  const isActive = idx <= animatedStep;
                  const barBefore = idx <= animatedStep;
                  const barAfter = idx < animatedStep;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                    >
                      <div className="flex items-center w-full">
                        {idx > 0 && (
                          <div className="h-1.5 flex-1 rounded-full bg-wheat overflow-hidden">
                            <div
                              className="h-full rounded-full bg-olive"
                              style={{
                                width: barBefore ? "100%" : "0%",
                                transition: "width 0.4s ease-out",
                              }}
                            />
                          </div>
                        )}
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                          style={{
                            backgroundColor: isActive ? "#6B7C4E" : "#F0E8D8",
                            color: isActive ? "#FEFCF3" : "rgba(90,60,30,0.3)",
                            transform: isActive ? "scale(1.15)" : "scale(1)",
                            transition:
                              "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        >
                          <step.icon size={18} />
                        </div>
                        {idx < steps.length - 1 && (
                          <div className="h-1.5 flex-1 rounded-full bg-wheat overflow-hidden">
                            <div
                              className="h-full rounded-full bg-olive"
                              style={{
                                width: barAfter ? "100%" : "0%",
                                transition: "width 0.4s ease-out",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <p
                        className="text-[11px] mt-2.5 font-semibold text-center leading-tight"
                        style={{
                          color: isActive ? "#6B7C4E" : "rgba(90,60,30,0.35)",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Stepper — animated */}
              <div className="flex sm:hidden flex-col gap-0 mb-8 pl-4">
                {steps.map((step, idx) => {
                  const isActive = idx <= animatedStep;
                  const barActive = idx < animatedStep;

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                          style={{
                            backgroundColor: isActive ? "#6B7C4E" : "#F0E8D8",
                            color: isActive ? "#FEFCF3" : "rgba(90,60,30,0.3)",
                            transform: isActive ? "scale(1.1)" : "scale(1)",
                            transition:
                              "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        >
                          <step.icon size={15} />
                        </div>
                        {idx < steps.length - 1 && (
                          <div className="w-0.5 h-10 bg-wheat overflow-hidden rounded-full">
                            <div
                              className="w-full bg-olive rounded-full"
                              style={{
                                height: barActive ? "100%" : "0%",
                                transition: "height 0.4s ease-out",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="pb-7 pt-1.5">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: isActive ? "#6B7C4E" : "rgba(90,60,30,0.35)",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Tracking Info - Show for all */}
          {order.trackingId && (
            <div className="border-t border-wheat pt-5 mb-5">
              <h3 className="font-display font-semibold text-brown mb-3">
                Tracking Information
              </h3>
              <div className="flex items-center gap-3 p-4 bg-olive/5 rounded-xl border border-olive/10">
                <FiTruck className="text-olive" size={24} />
                <div>
                  <p className="text-sm font-medium text-brown">
                    {order.deliveryPartner}
                  </p>
                  <p className="text-xs text-brown/60 font-mono">
                    Tracking ID: {order.trackingId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Owner-only content */}
          {isOwner ? (
            <>
              {/* Items */}
              <div className="border-t border-wheat pt-5">
                <h3 className="font-display font-semibold text-brown mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-wheat"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-brown/50">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-brown">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-wheat pt-3 mt-3">
                  <span className="font-medium text-brown">Total</span>
                  <span className="font-bold text-olive text-lg">
                    ₹{order.totalPrice}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="mt-5 bg-ivory rounded-xl p-4">
                  <p className="text-xs text-brown/50 mb-1">Delivery Address</p>
                  <p className="text-sm text-brown font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-brown/70">
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                    , {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  {order.shippingAddress.phone && (
                    <p className="text-xs text-brown/50 mt-1">
                      📞 {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Non-owner restricted view */
            <div className="border-t border-wheat pt-5">
              <div className="bg-wheat/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-brown/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiLock className="text-brown/50" size={20} />
                </div>
                <h3 className="font-semibold text-brown mb-2">
                  Order Details Hidden
                </h3>
                <p className="text-sm text-brown/60 mb-4">
                  For privacy, order items and delivery address are only visible
                  to the person who placed this order.
                </p>
                {!user ? (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-olive text-ivory rounded-lg font-medium text-sm hover:bg-olive/90 transition-colors"
                  >
                    <FiLogIn size={16} /> Login to View Details
                  </Link>
                ) : (
                  <p className="text-xs text-brown/50">
                    If this is your order, please login with the account used to
                    place it.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
