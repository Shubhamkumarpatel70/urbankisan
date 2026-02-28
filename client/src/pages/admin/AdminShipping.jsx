import { useState, useEffect } from "react";
import {
  FiTruck,
  FiDollarSign,
  FiPercent,
  FiPlus,
  FiTrash2,
  FiSave,
  FiZap,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const AdminShipping = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    shippingCharge: 50,
    freeShippingThreshold: 499,
    discountTiers: [],
    expressDeliveryCharge: 99,
    expressDeliveryEnabled: true,
  });

  // New tier form state
  const [newTier, setNewTier] = useState({
    minAmount: "",
    discountPercent: "",
    label: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/settings/shipping");
      setSettings({
        shippingCharge: data.shippingCharge || 50,
        freeShippingThreshold: data.freeShippingThreshold || 499,
        discountTiers: data.discountTiers || [],
        expressDeliveryCharge: data.expressDeliveryCharge || 99,
        expressDeliveryEnabled: data.expressDeliveryEnabled !== false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      addToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put("/api/settings/shipping", settings);
      addToast("Settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const addDiscountTier = () => {
    if (!newTier.minAmount || !newTier.discountPercent) {
      addToast("Please fill in minimum amount and discount percent", "error");
      return;
    }

    const tier = {
      minAmount: Number(newTier.minAmount),
      discountPercent: Number(newTier.discountPercent),
      label:
        newTier.label ||
        `${newTier.discountPercent}% off on orders above ₹${newTier.minAmount}`,
    };

    setSettings((prev) => ({
      ...prev,
      discountTiers: [...prev.discountTiers, tier].sort(
        (a, b) => a.minAmount - b.minAmount,
      ),
    }));

    setNewTier({ minAmount: "", discountPercent: "", label: "" });
  };

  const removeDiscountTier = (index) => {
    setSettings((prev) => ({
      ...prev,
      discountTiers: prev.discountTiers.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-wheat rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-wheat/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-brown">
          Shipping & Discount Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-olive text-ivory px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors disabled:opacity-50"
        >
          <FiSave size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Shipping Charges Section */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center">
            <FiTruck className="text-olive" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-brown">Shipping Charges</h3>
            <p className="text-sm text-brown/50">
              Configure delivery fees and free shipping threshold
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">
              Standard Shipping Charge (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40">
                ₹
              </span>
              <input
                type="number"
                value={settings.shippingCharge}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    shippingCharge: Number(e.target.value),
                  }))
                }
                className="input-field pl-8"
                placeholder="50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">
              Free Shipping Above (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40">
                ₹
              </span>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    freeShippingThreshold: Number(e.target.value),
                  }))
                }
                className="input-field pl-8"
                placeholder="499"
              />
            </div>
            <p className="text-xs text-brown/50 mt-1">
              Orders above this amount get free shipping
            </p>
          </div>
        </div>
      </div>

      {/* Express Delivery Section */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
            <FiZap className="text-gold" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-brown">Express Delivery</h3>
            <p className="text-sm text-brown/50">
              Fast delivery option for urgent orders
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">
              Express Delivery Charge (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40">
                ₹
              </span>
              <input
                type="number"
                value={settings.expressDeliveryCharge}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    expressDeliveryCharge: Number(e.target.value),
                  }))
                }
                className="input-field pl-8"
                placeholder="99"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1.5">
              Enable Express Delivery
            </label>
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  expressDeliveryEnabled: !prev.expressDeliveryEnabled,
                }))
              }
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.expressDeliveryEnabled ? "bg-olive" : "bg-brown/20"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.expressDeliveryEnabled
                    ? "translate-x-8"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Discount Tiers Section */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <FiPercent className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-brown">Order Discount Tiers</h3>
            <p className="text-sm text-brown/50">
              Set automatic discounts based on order value
            </p>
          </div>
        </div>

        {/* Existing Tiers */}
        {settings.discountTiers.length > 0 && (
          <div className="mb-5 space-y-2">
            {settings.discountTiers.map((tier, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-ivory rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">
                      {tier.discountPercent}%
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-brown text-sm">
                      {tier.label}
                    </p>
                    <p className="text-xs text-brown/50">
                      Min. order: ₹{tier.minAmount}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDiscountTier(index)}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Tier Form */}
        <div className="p-4 bg-wheat/30 rounded-xl">
          <p className="text-sm font-medium text-brown mb-3">
            Add New Discount Tier
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-brown/60 mb-1">
                Min. Order Amount (₹)
              </label>
              <input
                type="number"
                value={newTier.minAmount}
                onChange={(e) =>
                  setNewTier((prev) => ({ ...prev, minAmount: e.target.value }))
                }
                className="input-field text-sm"
                placeholder="999"
              />
            </div>
            <div>
              <label className="block text-xs text-brown/60 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={newTier.discountPercent}
                onChange={(e) =>
                  setNewTier((prev) => ({
                    ...prev,
                    discountPercent: e.target.value,
                  }))
                }
                className="input-field text-sm"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs text-brown/60 mb-1">
                Label (Optional)
              </label>
              <input
                type="text"
                value={newTier.label}
                onChange={(e) =>
                  setNewTier((prev) => ({ ...prev, label: e.target.value }))
                }
                className="input-field text-sm"
                placeholder="10% off on orders above ₹999"
              />
            </div>
          </div>
          <button
            onClick={addDiscountTier}
            className="inline-flex items-center gap-2 bg-olive text-ivory px-4 py-2 rounded-lg text-sm font-medium hover:bg-olive/90 transition-colors"
          >
            <FiPlus size={14} /> Add Discount Tier
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-olive/5 to-gold/5 rounded-xl p-5 sm:p-6 border border-olive/10">
        <h3 className="font-semibold text-brown mb-4">
          Preview (How it looks in cart)
        </h3>
        <div className="bg-white rounded-xl p-4 max-w-sm shadow-sm">
          <p className="text-sm text-brown/60 mb-2">Subtotal (3 items)</p>
          <p className="font-semibold text-brown mb-3">₹450</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brown/60">Shipping</span>
              <span className="text-brown">₹{settings.shippingCharge}</span>
            </div>
            <p className="text-olive text-xs">
              Add ₹{settings.freeShippingThreshold - 450} more for free
              shipping!
            </p>
          </div>

          {settings.discountTiers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-wheat">
              <p className="text-xs text-brown/50 mb-1">Available Offers:</p>
              {settings.discountTiers.slice(0, 2).map((tier, i) => (
                <p key={i} className="text-xs text-green-600">
                  • {tier.label}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShipping;
