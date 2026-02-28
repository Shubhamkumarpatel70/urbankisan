import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiTag,
  FiX,
  FiCheck,
  FiPercent,
  FiSave,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, getDiscount, validating } =
    useOrder();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [utrCopied, setUtrCopied] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [paymentMethodsConfig, setPaymentMethodsConfig] = useState(null);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Load saved address from user profile
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const { data } = await axios.get("/api/users/profile");
        if (data.address && data.address.street) {
          setAddress({
            fullName: data.name || user?.name || "",
            phone: data.address.phone || "",
            street: data.address.street || "",
            city: data.address.city || "",
            state: data.address.state || "",
            pincode: data.address.pincode || "",
          });
          setHasSavedAddress(true);
          setSaveAddress(false); // Already saved
        }
      } catch (error) {
        // Ignore — user might not have profile loaded
      } finally {
        setLoadingAddress(false);
      }
    };
    if (isAuthenticated) loadSavedAddress();
    else setLoadingAddress(false);
  }, [isAuthenticated]);

  // Fetch available coupons from API
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get("/api/coupons/active");
        setAvailableCoupons(data);
      } catch (err) {
        // ignore
      }
    };
    if (isAuthenticated) fetchCoupons();
  }, [isAuthenticated]);

  // Fetch payment methods settings
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const { data } = await axios.get("/api/settings/payment-methods");
        setPaymentMethodsConfig(data.paymentMethods);
        // Set default payment method to first enabled one
        const methods = data.paymentMethods;
        if (methods.cod?.enabled) setPaymentMethod("COD");
        else if (methods.upi?.enabled) setPaymentMethod("UPI");
        else if (methods.card?.enabled) setPaymentMethod("CARD");
      } catch (err) {
        // Use defaults if fetch fails
        setPaymentMethodsConfig({
          cod: {
            enabled: true,
            label: "Cash on Delivery",
            description: "Pay when you receive",
          },
          upi: {
            enabled: true,
            label: "UPI Payment",
            description: "GPay, PhonePe, Paytm",
            upiId: "urbankisan@upi",
          },
          card: {
            enabled: true,
            label: "Credit / Debit Card",
            description: "Visa, Mastercard, RuPay",
          },
        });
        setPaymentMethod("COD");
      }
    };
    fetchPaymentMethods();
  }, []);

  const subtotal = getCartTotal();
  const discount = getDiscount(subtotal);
  const shipping = subtotal > 499 ? 0 : 50;
  const total = subtotal - discount + shipping;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

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

  const handlePlaceOrder = async () => {
    // Validate
    if (
      !address.fullName ||
      !address.phone ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      addToast("Please fill in all address fields", "error");
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      addToast("Please enter a valid 10-digit phone number", "error");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      addToast("Please enter a valid 6-digit pincode", "error");
      return;
    }
    // UTR required for UPI
    if (paymentMethod === "UPI" && !utrNumber.trim()) {
      addToast("Please enter UTR number for UPI payment", "error");
      return;
    }
    if (paymentMethod === "UPI" && utrNumber.trim().length < 12) {
      addToast("Please enter a valid UTR number (12+ characters)", "error");
      return;
    }

    setPlacing(true);
    try {
      const { data: order } = await axios.post("/api/orders", {
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        totalPrice: total,
        saveAddress,
        // UPI Payment info
        utrNumber: paymentMethod === "UPI" ? utrNumber.trim() : undefined,
        // Discount info
        discountAmount: discount,
        discountType:
          appliedCoupon?.type || (discount > 0 ? "tier" : undefined),
        discountCode: appliedCoupon?.code || undefined,
      });

      clearCart();
      removeCoupon();
      addToast("Order placed successfully! 🎉", "success");
      navigate(`/order-confirmation/${order._id}`);
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to place order",
        "error",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="section-padding">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="font-display text-3xl font-bold text-brown mb-4">
            No Items to Checkout
          </h2>
          <p className="text-brown/70 mb-8">
            Add some products to your cart first.
          </p>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-olive mb-6 hover:gap-3 transition-all"
        >
          <FiArrowLeft /> Back to Cart
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brown mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
                    <FiMapPin className="text-olive" size={20} />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-brown">
                    Shipping Address
                  </h2>
                </div>
                {hasSavedAddress && (
                  <span className="text-xs bg-olive/10 text-olive px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <FiCheck size={10} /> Saved
                  </span>
                )}
              </div>

              {loadingAddress ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-wheat/30 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brown mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={address.fullName}
                        onChange={handleAddressChange}
                        placeholder="Enter full name"
                        className="input-field"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brown mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="input-field"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-brown mb-1.5">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        placeholder="House no., Building, Street"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brown mb-1.5">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Save Address Checkbox */}
                  {!hasSavedAddress && (
                    <label className="flex items-center gap-2.5 mt-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 rounded border-wheat text-olive focus:ring-olive"
                      />
                      <span className="text-sm text-brown/70 group-hover:text-brown transition-colors flex items-center gap-1.5">
                        <FiSave size={14} /> Save this address for future orders
                      </span>
                    </label>
                  )}
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                  <FiCreditCard className="text-gold" size={20} />
                </div>
                <h2 className="font-display text-xl font-semibold text-brown">
                  Payment Method
                </h2>
              </div>

              {!paymentMethodsConfig ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-wheat rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : paymentMethodsConfig.cod?.enabled ||
                paymentMethodsConfig.upi?.enabled ||
                paymentMethodsConfig.card?.enabled ? (
                <>
                  <div className="space-y-3">
                    {paymentMethodsConfig &&
                      [
                        paymentMethodsConfig.cod?.enabled && {
                          value: "COD",
                          label:
                            paymentMethodsConfig.cod.label ||
                            "Cash on Delivery",
                          icon: "💵",
                          desc:
                            paymentMethodsConfig.cod.description ||
                            "Pay when you receive",
                        },
                        paymentMethodsConfig.upi?.enabled && {
                          value: "UPI",
                          label:
                            paymentMethodsConfig.upi.label || "UPI Payment",
                          icon: "📱",
                          desc:
                            paymentMethodsConfig.upi.description ||
                            "GPay, PhonePe, Paytm",
                        },
                        paymentMethodsConfig.card?.enabled && {
                          value: "CARD",
                          label:
                            paymentMethodsConfig.card.label ||
                            "Credit / Debit Card",
                          icon: "💳",
                          desc:
                            paymentMethodsConfig.card.description ||
                            "Visa, Mastercard, RuPay",
                        },
                      ]
                        .filter(Boolean)
                        .map((method) => (
                          <label
                            key={method.value}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === method.value
                                ? "border-olive bg-olive/5"
                                : "border-wheat hover:border-olive/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-2xl">{method.icon}</span>
                            <div className="flex-1">
                              <p className="font-medium text-brown">
                                {method.label}
                              </p>
                              <p className="text-sm text-brown/60">
                                {method.desc}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                paymentMethod === method.value
                                  ? "border-olive bg-olive"
                                  : "border-wheat"
                              }`}
                            >
                              {paymentMethod === method.value && (
                                <FiCheck className="text-ivory" size={12} />
                              )}
                            </div>
                          </label>
                        ))}
                  </div>

                  {/* UPI Payment Section */}
                  {paymentMethod === "UPI" && paymentMethodsConfig?.upi && (
                    <div className="mt-5 p-4 bg-ivory rounded-xl border border-wheat animate-slideIn">
                      <h3 className="font-medium text-brown mb-4 flex items-center gap-2">
                        📱 Complete UPI Payment
                      </h3>

                      {/* UPI ID to pay */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-brown/60 mb-1.5">
                          Pay to UPI ID
                        </label>
                        <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-wheat">
                          <span className="font-mono font-medium text-olive flex-1">
                            {paymentMethodsConfig.upi.upiId || "urbankisan@upi"}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                paymentMethodsConfig.upi.upiId ||
                                  "urbankisan@upi",
                              );
                              setUtrCopied(true);
                              addToast("UPI ID copied!", "success");
                              setTimeout(() => setUtrCopied(false), 2000);
                            }}
                            className="text-olive hover:bg-olive/10 p-1.5 rounded-lg transition-colors"
                          >
                            {utrCopied ? (
                              <FiCheck size={16} />
                            ) : (
                              <FiCopy size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Open UPI App */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-brown/60 mb-1.5">
                          Quick Pay (opens your UPI app)
                        </label>
                        <a
                          href={`upi://pay?pa=${encodeURIComponent(paymentMethodsConfig.upi.upiId || "urbankisan@upi")}&pn=UrbanKisan&am=${total}&cu=INR&tn=Order%20Payment`}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-olive/10 text-olive rounded-xl font-medium hover:bg-olive/20 transition-colors"
                        >
                          <FiExternalLink size={18} />
                          Pay ₹{total} via UPI App
                        </a>
                        <p className="text-xs text-brown/50 mt-2 text-center">
                          Works with GPay, PhonePe, Paytm, BHIM & others
                        </p>
                      </div>

                      {/* UTR Input */}
                      <div>
                        <label className="block text-sm font-medium text-brown mb-1.5">
                          UTR / Transaction Reference Number{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) =>
                            setUtrNumber(e.target.value.toUpperCase())
                          }
                          placeholder="Enter 12-digit UTR number"
                          className="input-field font-mono uppercase"
                        />
                        <p className="text-xs text-brown/50 mt-1.5">
                          💡 UTR can be found in your payment app under
                          transaction details
                        </p>
                      </div>

                      {utrNumber.length > 0 && utrNumber.length < 12 && (
                        <p className="text-xs text-orange-500 mt-2">
                          UTR number should be at least 12 characters
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 bg-red-50 rounded-xl">
                  <p className="text-red-600 font-medium">
                    No payment methods available
                  </p>
                  <p className="text-sm text-red-500/70 mt-1">
                    Please contact support
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 sticky top-28">
              <h2 className="font-display text-xl font-semibold text-brown mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto no-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brown truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-brown/60">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-brown">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FiTag className="text-olive" size={16} />
                  <span className="text-sm font-medium text-brown">
                    Coupon Code
                  </span>
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="ml-auto text-xs text-olive hover:underline"
                  >
                    {showCoupons ? "Hide codes" : "View codes"}
                  </button>
                </div>

                {showCoupons && availableCoupons.length > 0 && (
                  <div className="mb-3 space-y-2 animate-slideIn">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCouponCode(c.code);
                          setShowCoupons(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 bg-ivory rounded-lg hover:bg-wheat/50 transition-colors text-left"
                      >
                        <div>
                          <span className="text-sm font-bold text-olive font-mono">
                            {c.code}
                          </span>
                          <p className="text-xs text-brown/60 mt-0.5">
                            Min. order ₹{c.minOrder}
                          </p>
                        </div>
                        <span className="text-xs font-medium bg-olive/10 text-olive px-2 py-1 rounded-full">
                          {c.type === "percent"
                            ? `${c.value}% off`
                            : `₹${c.value} off`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-olive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiPercent className="text-olive" size={16} />
                      <span className="text-sm font-bold text-olive font-mono">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-xs text-olive/80">
                        - {appliedCoupon.label}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-olive hover:text-red-500"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
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
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-brown/70">
                  <span>
                    Subtotal ({cartItems.reduce((c, i) => c + i.quantity, 0)}{" "}
                    items)
                  </span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-olive">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-brown/70">
                  <span>Shipping</span>
                  <span
                    className={shipping === 0 ? "text-olive font-medium" : ""}
                  >
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-wheat pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-brown">
                  <span>Total</span>
                  <span className="text-olive">₹{total}</span>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-olive mt-1">
                    You save ₹{discount} on this order!
                  </p>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  placing ||
                  (paymentMethod === "UPI" && utrNumber.trim().length < 12)
                }
                className="w-full btn-primary text-center py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? "Placing Order..." : `Place Order — ₹${total}`}
              </button>

              {paymentMethod === "UPI" && utrNumber.trim().length < 12 && (
                <p className="text-xs text-orange-500 text-center mt-2">
                  Enter UTR number to place order
                </p>
              )}

              <p className="text-xs text-brown/50 text-center mt-3">
                🔒 Secure checkout · 100% Purchase Protection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
