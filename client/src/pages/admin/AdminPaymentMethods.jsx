import { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiDollarSign,
  FiSmartphone,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
  FiEdit2,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const AdminPaymentMethods = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
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

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await axios.get("/api/settings/payment-methods");
      if (data.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        enabled: !prev[method].enabled,
      },
    }));
  };

  const handleFieldChange = (method, field, value) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/settings/payment-methods", { paymentMethods });
      addToast("Payment methods updated successfully!", "success");
    } catch (error) {
      addToast("Failed to update payment methods", "error");
    } finally {
      setSaving(false);
    }
  };

  const methodIcons = {
    cod: { icon: FiDollarSign, emoji: "💵" },
    upi: { icon: FiSmartphone, emoji: "📱" },
    card: { icon: FiCreditCard, emoji: "💳" },
  };

  const methodOrder = ["cod", "upi", "card"];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-wheat rounded w-1/3 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-brown">
            Payment Methods
          </h2>
          <p className="text-brown/60 text-sm mt-1">
            Enable or disable payment options for checkout
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-olive text-ivory rounded-xl font-medium hover:bg-olive/90 transition-colors disabled:opacity-50"
        >
          <FiSave size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Payment Methods Cards */}
      <div className="space-y-4">
        {methodOrder.map((key) => {
          const method = paymentMethods[key];
          const { emoji } = methodIcons[key];

          return (
            <div
              key={key}
              className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-all ${
                method.enabled
                  ? "border-olive/20"
                  : "border-transparent opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    method.enabled ? "bg-olive/10" : "bg-wheat"
                  }`}
                >
                  {emoji}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <input
                        type="text"
                        value={method.label}
                        onChange={(e) =>
                          handleFieldChange(key, "label", e.target.value)
                        }
                        className="font-semibold text-brown bg-transparent border-b border-transparent hover:border-wheat focus:border-olive focus:outline-none transition-colors"
                      />
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          method.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {method.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(key)}
                      className={`p-2 rounded-lg transition-colors ${
                        method.enabled
                          ? "text-olive hover:bg-olive/10"
                          : "text-brown/40 hover:bg-wheat"
                      }`}
                    >
                      {method.enabled ? (
                        <FiToggleRight size={28} className="text-olive" />
                      ) : (
                        <FiToggleLeft size={28} />
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={method.description}
                    onChange={(e) =>
                      handleFieldChange(key, "description", e.target.value)
                    }
                    className="text-sm text-brown/60 bg-transparent border-b border-transparent hover:border-wheat focus:border-olive focus:outline-none transition-colors w-full"
                    placeholder="Description..."
                  />

                  {/* UPI ID field for UPI method */}
                  {key === "upi" && (
                    <div className="mt-4 p-3 bg-ivory rounded-lg">
                      <label className="block text-xs font-medium text-brown/60 mb-1.5">
                        UPI ID (Merchant)
                      </label>
                      <input
                        type="text"
                        value={method.upiId || ""}
                        onChange={(e) =>
                          handleFieldChange(key, "upiId", e.target.value)
                        }
                        placeholder="yourname@upi"
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-wheat bg-white text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
                      />
                      <p className="text-xs text-brown/50 mt-1.5">
                        This UPI ID will be shown to customers for payment
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-brown mb-4 flex items-center gap-2">
          <FiEdit2 size={16} className="text-olive" />
          Preview (What customers will see)
        </h3>
        <div className="space-y-3 max-w-md">
          {methodOrder
            .filter((key) => paymentMethods[key].enabled)
            .map((key) => {
              const method = paymentMethods[key];
              const { emoji } = methodIcons[key];

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-wheat bg-ivory"
                >
                  <span className="text-2xl">{emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-brown">{method.label}</p>
                    <p className="text-sm text-brown/60">
                      {method.description}
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-wheat"></div>
                </div>
              );
            })}

          {methodOrder.filter((key) => paymentMethods[key].enabled).length ===
            0 && (
            <p className="text-brown/50 text-center py-4">
              No payment methods enabled. Enable at least one method.
            </p>
          )}
        </div>
      </div>

      {/* Warning */}
      {methodOrder.filter((key) => paymentMethods[key].enabled).length ===
        0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">
            ⚠️ Warning: No payment methods are enabled. Customers won't be able
            to checkout!
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethods;
