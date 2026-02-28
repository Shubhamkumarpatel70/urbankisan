import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiShoppingBag,
  FiTag,
  FiX,
  FiPercent,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import axios from "axios";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, getDiscount } = useOrder();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [shippingSettings, setShippingSettings] = useState({
    shippingCharge: 50,
    freeShippingThreshold: 499,
    discountTiers: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shipping settings
        const { data: settings } = await axios.get("/api/settings/shipping");
        setShippingSettings({
          shippingCharge: settings.shippingCharge || 50,
          freeShippingThreshold: settings.freeShippingThreshold || 499,
          discountTiers: settings.discountTiers || [],
        });

        // Fetch coupons if authenticated
        if (isAuthenticated) {
          const { data: coupons } = await axios.get("/api/coupons/active");
          setAvailableCoupons(coupons);
        }
      } catch (err) { /* ignore */ }
    };
    fetchData();
  }, [isAuthenticated]);

  const subtotal = getCartTotal();
  const couponDiscount = getDiscount(subtotal);
  
  // Calculate tier discount based on subtotal
  const applicableTier = shippingSettings.discountTiers
    .filter((tier) => subtotal >= tier.minAmount)
    .sort((a, b) => b.minAmount - a.minAmount)[0];
  const tierDiscount = applicableTier
    ? Math.round((subtotal * applicableTier.discountPercent) / 100)
    : 0;
  
  // Total discount (coupon or tier, whichever is higher)
  const totalDiscount = Math.max(couponDiscount, tierDiscount);
  const appliedTierDiscount = tierDiscount > couponDiscount && !appliedCoupon;
  
  const shippingCost = subtotal >= shippingSettings.freeShippingThreshold ? 0 : shippingSettings.shippingCharge;
  const total = subtotal - totalDiscount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await applyCoupon(couponCode, subtotal);
    if (result.success) {
      addToast(result.message, "success");
      setCouponCode("");
    } else {
      addToast(result.message, "error");
    }
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item._id);
    addToast(`${item.name} removed from cart`, "info");
  };

  if (cartItems.length === 0) {
    return (
      <div className="section-padding">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-wheat rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="text-olive" size={40} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-brown/70 mb-8 text-sm sm:text-base">
            Looks like you haven't added any products yet. Start shopping to
            fill your cart!
          </p>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-brown mb-6 sm:mb-8">
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {cartItems.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 ${index !== cartItems.length - 1
                    ? "border-b border-wheat"
                    : ""
                    }`}
                >
                  {/* Product Image + Info Row */}
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 min-w-0">
                    <Link to={`/product/${item._id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-wheat rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/96?text=Product";
                          }}
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item._id}`}
                        className="font-display text-sm sm:text-lg font-semibold text-brown hover:text-olive transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs sm:text-sm text-brown/60 mt-0.5">
                        {item.weight || "500g"}
                      </p>
                      <p className="text-olive font-semibold mt-1 sm:mt-2 text-sm sm:text-base">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity + Total + Remove */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4 pl-[84px] sm:pl-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-wheat flex items-center justify-center text-brown hover:bg-wheat transition-colors active:scale-95"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-brown text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-wheat flex items-center justify-center text-brown hover:bg-wheat transition-colors active:scale-95"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <p className="font-semibold text-brown text-sm sm:text-base min-w-[60px] text-right">
                      ₹{item.price * item.quantity}
                    </p>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-brown/40 hover:text-red-500 transition-colors p-1"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-4 sm:mt-6">
              <Link
                to="/products"
                className="text-olive font-medium flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base"
              >
                <FiArrowLeft /> Continue Shopping
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  addToast("Cart cleared", "info");
                }}
                className="text-brown/60 hover:text-red-500 font-medium transition-colors text-sm sm:text-base"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 sticky top-28">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-brown mb-5 sm:mb-6">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <FiTag className="text-olive" size={15} />
                  <span className="text-sm font-medium text-brown">Coupon Code</span>
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="ml-auto text-xs text-olive hover:underline"
                  >
                    {showCoupons ? "Hide" : "View codes"}
                  </button>
                </div>

                {showCoupons && availableCoupons.length > 0 && (
                  <div className="mb-3 space-y-1.5 animate-slideIn">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCouponCode(c.code); setShowCoupons(false); }}
                        className="w-full flex items-center justify-between p-2 bg-ivory rounded-lg hover:bg-wheat/50 transition-colors text-left"
                      >
                        <span className="text-xs font-bold text-olive font-mono">{c.code}</span>
                        <span className="text-xs text-olive/80">{c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`}</span>
                      </button>
                    ))}
                  </div>
                )}

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-olive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiPercent className="text-olive" size={14} />
                      <span className="text-sm font-bold text-olive font-mono">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={() => { removeCoupon(); addToast("Coupon removed", "info"); }} className="text-olive hover:text-red-500">
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive uppercase font-mono"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-olive text-ivory text-sm rounded-lg font-medium hover:bg-olive/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                <div className="flex justify-between text-sm text-brown/70">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-olive font-medium">
                    <span>
                      {appliedTierDiscount
                        ? `Tier Discount (${applicableTier?.discountPercent}%)`
                        : "Coupon Discount"}
                    </span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-brown/70">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-olive font-medium" : ""}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>
                {shippingCost > 0 && subtotal < shippingSettings.freeShippingThreshold && (
                  <p className="text-xs text-olive">
                    Add ₹{shippingSettings.freeShippingThreshold - subtotal} more for free shipping!
                  </p>
                )}
                
                {/* Show available tier discounts */}
                {shippingSettings.discountTiers.length > 0 && (
                  <div className="pt-2 border-t border-wheat/50">
                    <p className="text-xs text-brown/50 mb-1.5">Available Offers:</p>
                    {shippingSettings.discountTiers.map((tier, i) => (
                      <p
                        key={i}
                        className={`text-xs ${
                          subtotal >= tier.minAmount
                            ? "text-olive font-medium"
                            : "text-brown/50"
                        }`}
                      >
                        {subtotal >= tier.minAmount ? "✓ " : "• "}
                        {tier.label || `${tier.discountPercent}% off on orders above ₹${tier.minAmount}`}
                        {subtotal < tier.minAmount && (
                          <span className="text-brown/40 ml-1">
                            (Add ₹{tier.minAmount - subtotal} more)
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-wheat pt-4 mb-5 sm:mb-6">
                <div className="flex justify-between text-lg font-semibold text-brown">
                  <span>Total</span>
                  <span className="text-olive">₹{total}</span>
                </div>
                {totalDiscount > 0 && (
                  <p className="text-xs text-olive mt-1">You save ₹{totalDiscount}!</p>
                )}
              </div>

              <Link to="/checkout" className="block w-full btn-primary text-center">
                Proceed to Checkout
              </Link>

              <p className="text-xs text-brown/50 text-center mt-3 sm:mt-4">
                🔒 Secure checkout powered by industry-standard encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
