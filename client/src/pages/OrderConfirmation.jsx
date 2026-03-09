import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheck, FiPackage, FiCopy } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../components/Toast";

// Confetti particle component
const Confetti = () => {
  const colors = [
    "#C19A49",
    "#5E6F52",
    "#E8D8B8",
    "#3A2C1F",
    "#FFD700",
    "#4CAF50",
  ];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// Success checkmark animation
const SuccessAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 600),
      setTimeout(() => setStage(3), 1000),
      setTimeout(() => setStage(4), 1400),
      setTimeout(() => onComplete?.(), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      {/* Background circle */}
      <div
        className={`absolute inset-0 rounded-full bg-olive/10 transition-all duration-500 ${
          stage >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />

      {/* Pulsing rings */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-olive/30 transition-all duration-700 ${
          stage >= 2 ? "scale-150 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <div
        className={`absolute inset-0 rounded-full border-2 border-gold/40 transition-all duration-1000 delay-200 ${
          stage >= 3 ? "scale-[1.8] opacity-0" : "scale-100 opacity-100"
        }`}
      />

      {/* Main circle */}
      <div
        className={`absolute inset-2 rounded-full bg-gradient-to-br from-olive to-olive/80 shadow-lg transition-all duration-500 ${
          stage >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {/* Checkmark SVG */}
        <svg viewBox="0 0 52 52" className="absolute inset-0 w-full h-full p-5">
          <path
            className={`stroke-ivory fill-none stroke-[4] transition-all duration-500 ${
              stage >= 2 ? "stroke-dashoffset-0" : ""
            }`}
            style={{
              strokeDasharray: 50,
              strokeDashoffset: stage >= 2 ? 0 : 50,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
            d="M14 27l8 8 16-16"
          />
        </svg>
      </div>

      {/* Sparkles */}
      {stage >= 3 && (
        <>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-sparkle">
            <span className="text-2xl">✨</span>
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 animate-sparkle delay-100">
            <span className="text-xl">⭐</span>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 animate-sparkle delay-200">
            <span className="text-lg">🌟</span>
          </div>
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 animate-sparkle delay-300">
            <span className="text-xl">✨</span>
          </div>
        </>
      )}
    </div>
  );
};

// Delivery Van Animation - Van picks up order and ready to ship
const OrderConfirmation = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data);
        // Trigger confetti after order loads
        setTimeout(() => setShowConfetti(true), 500);
        // Hide confetti after 4 seconds
        setTimeout(() => setShowConfetti(false), 4500);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
    setTimeout(() => setContentVisible(true), 300);
  };

  const copyOrderId = () => {
    const oid = order?.orderId || order?._id;
    navigator.clipboard.writeText(oid);
    addToast("Order ID copied!", "success");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="w-32 h-32 bg-wheat/30 rounded-full mx-auto mb-6 animate-pulse" />
          <div className="h-8 bg-wheat/50 rounded w-2/3 mx-auto animate-pulse mb-3" />
          <div className="h-4 bg-wheat/30 rounded w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <FiPackage className="mx-auto text-brown/30 mb-4" size={48} />
        <p className="text-brown/60 mb-4">Order not found</p>
        <Link to="/products" className="text-olive font-medium hover:underline">
          Continue Shopping →
        </Link>
      </div>
    );
  }

  const displayId = order.orderId || order._id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative">
      {/* Confetti Animation */}
      {showConfetti && <Confetti />}

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm text-center mb-6 overflow-hidden">
        {/* Success Animation */}
        <SuccessAnimation onComplete={handleAnimationComplete} />

        {/* Title with animation */}
        <div
          className={`transition-all duration-700 ${
            animationComplete
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-brown/60 mb-4">
            Thank you for your order. We'll notify you when it's shipped.
          </p>
        </div>

        {/* Order ID Box */}
        <div
          className={`bg-gradient-to-r from-ivory to-wheat/50 rounded-xl p-4 mb-6 transition-all duration-700 delay-100 ${
            animationComplete
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          <p className="text-xs text-brown/50 mb-1">Order ID</p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-mono font-bold text-olive text-xl tracking-wide">
              {displayId}
            </p>
            <button
              onClick={copyOrderId}
              className="w-8 h-8 rounded-lg bg-olive/10 text-olive flex items-center justify-center hover:bg-olive/20 hover:scale-110 transition-all active:scale-95"
              title="Copy Order ID"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </div>

        {/* Order Details with staggered animation */}
        <div
          className={`text-left space-y-4 transition-all duration-700 delay-200 ${
            contentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="font-display font-semibold text-brown flex items-center gap-2">
            <FiPackage className="text-olive" /> Order Items
          </h3>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-ivory/50 p-3 rounded-xl hover:bg-ivory transition-colors"
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-lg object-cover bg-wheat shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brown truncate">
                  {item.name}
                </p>
                <p className="text-xs text-brown/50">
                  Qty: {item.quantity}
                  {item.weight && (
                    <span className="ml-2 text-olive font-medium">
                      ({item.weight})
                    </span>
                  )}
                </p>
              </div>
              <p className="text-sm font-bold text-olive">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}

          {/* Summary */}
          <div className="border-t border-wheat pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brown/60">Items Total</span>
              <span className="text-brown">₹{order.itemsPrice}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Discount {order.discountCode && `(${order.discountCode})`}
                </span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-brown/60">Shipping</span>
              <span
                className={
                  order.shippingPrice === 0 ? "text-olive" : "text-brown"
                }
              >
                {order.shippingPrice === 0 ? "Free" : `₹${order.shippingPrice}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-wheat pt-2">
              <span className="text-brown">Total</span>
              <span className="text-olive">₹{order.totalPrice}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gradient-to-br from-ivory to-wheat/30 rounded-xl p-4 border border-wheat/50">
              <p className="text-xs text-brown/50 mb-1 flex items-center gap-1">
                📍 Shipping Address
              </p>
              {order.shippingAddress.fullName && (
                <p className="text-sm font-medium text-brown">
                  {order.shippingAddress.fullName}
                </p>
              )}
              <p className="text-sm text-brown/70">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-xs text-brown/50 mt-1">
                  📞 {order.shippingAddress.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions with animation */}
      <div
        className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-500 ${
          contentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        <Link
          to={`/track-order?id=${displayId}`}
          className="flex-1 flex items-center justify-center gap-2 bg-olive text-ivory px-6 py-3.5 rounded-xl font-medium hover:bg-olive/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-olive/20"
        >
          <FiPackage size={18} /> Track Order
        </Link>
        <Link
          to="/products"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-olive text-olive px-6 py-3.5 rounded-xl font-medium hover:bg-olive hover:text-ivory hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Continue Shopping
        </Link>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }
        .animate-sparkle {
          animation: sparkle 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;
