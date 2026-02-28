import { useState, useEffect } from "react";
import {
    FiPlus, FiEdit2, FiTrash2, FiTag, FiPercent, FiX, FiCheck,
    FiUsers, FiUser, FiStar, FiGift,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const emptyForm = {
    code: "",
    type: "percent",
    value: "",
    minOrder: "",
    maxDiscount: "",
    isActive: true,
    expiresAt: "",
    usageLimit: "",
    target: "all",
    category: "general",
    targetUsers: [],
    description: "",
};

const categoryLabels = {
    general: "General",
    festival: "🎉 Festival",
    welcome: "👋 Welcome",
    seasonal: "🌿 Seasonal",
    clearance: "🏷️ Clearance",
    loyalty: "⭐ Loyalty",
};

const targetLabels = {
    all: "All Users",
    newUsers: "New Users Only",
    specificUsers: "Specific Users",
};

const targetColors = {
    all: "bg-olive/10 text-olive",
    newUsers: "bg-blue-50 text-blue-600",
    specificUsers: "bg-purple-50 text-purple-600",
};

const categoryColors = {
    general: "bg-wheat text-brown",
    festival: "bg-orange-50 text-orange-600",
    welcome: "bg-blue-50 text-blue-600",
    seasonal: "bg-olive/10 text-olive",
    clearance: "bg-red-50 text-red-500",
    loyalty: "bg-gold/20 text-gold",
};

const AdminCoupons = () => {
    const { addToast } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        fetchCoupons();
        fetchUsers();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await axios.get("/api/coupons");
            setCoupons(data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/coupons/users");
            setAllUsers(data);
        } catch (err) { /* ignore */ }
    };

    const openCreate = () => {
        setForm(emptyForm);
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (coupon) => {
        setForm({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder || "",
            maxDiscount: coupon.maxDiscount || "",
            isActive: coupon.isActive,
            expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
            usageLimit: coupon.usageLimit || "",
            target: coupon.target || "all",
            category: coupon.category || "general",
            targetUsers: coupon.targetUsers?.map((u) => (typeof u === "object" ? u._id : u)) || [],
            description: coupon.description || "",
        });
        setEditing(coupon._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.value) {
            addToast("Code and value are required", "error");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                code: form.code.toUpperCase(),
                type: form.type,
                value: Number(form.value),
                minOrder: form.minOrder ? Number(form.minOrder) : 0,
                maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                isActive: form.isActive,
                expiresAt: form.expiresAt || null,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                target: form.target,
                category: form.category,
                targetUsers: form.target === "specificUsers" ? form.targetUsers : [],
                description: form.description,
            };

            if (editing) {
                const { data } = await axios.put(`/api/coupons/${editing}`, payload);
                setCoupons((prev) => prev.map((c) => (c._id === editing ? data : c)));
                addToast("Coupon updated!", "success");
            } else {
                const { data } = await axios.post("/api/coupons", payload);
                setCoupons((prev) => [data, ...prev]);
                addToast("Coupon created!", "success");
            }
            setShowForm(false);
            setEditing(null);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to save coupon", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this coupon?")) return;
        try {
            await axios.delete(`/api/coupons/${id}`);
            setCoupons((prev) => prev.filter((c) => c._id !== id));
            addToast("Coupon deleted", "success");
        } catch (error) {
            addToast("Failed to delete coupon", "error");
        }
    };

    const toggleActive = async (coupon) => {
        try {
            const { data } = await axios.put(`/api/coupons/${coupon._id}`, {
                isActive: !coupon.isActive,
            });
            setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? data : c)));
            addToast(`Coupon ${data.isActive ? "activated" : "deactivated"}`, "success");
        } catch (error) {
            addToast("Failed to update coupon", "error");
        }
    };

    const toggleUserSelection = (userId) => {
        setForm((prev) => ({
            ...prev,
            targetUsers: prev.targetUsers.includes(userId)
                ? prev.targetUsers.filter((id) => id !== userId)
                : [...prev.targetUsers, userId],
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-2xl font-bold text-brown">Manage Coupons</h2>
                    <p className="text-brown/60 text-sm mt-1">{coupons.length} total coupons</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-olive text-ivory px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-all active:scale-95"
                >
                    <FiPlus size={16} /> Create Coupon
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-5 border-2 border-olive/20 animate-fadeIn">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-display font-semibold text-brown">
                            {editing ? "Edit Coupon" : "Create New Coupon"}
                        </h3>
                        <button onClick={() => setShowForm(false)} className="text-brown/40 hover:text-brown">
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Row 1: Code + Type */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Coupon Code *</label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="input-field font-mono uppercase"
                                    placeholder="e.g. DIWALI50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="input-field"
                                    placeholder="Festival sale discount..."
                                />
                            </div>
                        </div>

                        {/* Row 2: Type + Value + Min + Max */}
                        <div className="grid sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Type *</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="percent">Percentage (%)</option>
                                    <option value="flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">
                                    Value * {form.type === "percent" ? "(%)" : "(₹)"}
                                </label>
                                <input
                                    type="number"
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    className="input-field"
                                    placeholder={form.type === "percent" ? "20" : "100"}
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Min Order (₹)</label>
                                <input
                                    type="number"
                                    value={form.minOrder}
                                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                                    className="input-field"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Max Discount (₹)</label>
                                <input
                                    type="number"
                                    value={form.maxDiscount}
                                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                                    className="input-field"
                                    placeholder="No limit"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Row 3: Category + Target */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="input-field"
                                >
                                    {Object.entries(categoryLabels).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Target Audience</label>
                                <select
                                    value={form.target}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="input-field"
                                >
                                    {Object.entries(targetLabels).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Specific Users Picker */}
                        {form.target === "specificUsers" && (
                            <div className="bg-ivory rounded-xl p-4">
                                <label className="block text-sm font-medium text-brown mb-2">
                                    Select Users ({form.targetUsers.length} selected)
                                </label>
                                <div className="max-h-40 overflow-y-auto space-y-1.5 no-scrollbar">
                                    {allUsers.map((u) => (
                                        <label key={u._id} className="flex items-center gap-2 cursor-pointer hover:bg-wheat/50 p-1.5 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={form.targetUsers.includes(u._id)}
                                                onChange={() => toggleUserSelection(u._id)}
                                                className="w-3.5 h-3.5 rounded border-wheat text-olive focus:ring-olive"
                                            />
                                            <span className="text-sm text-brown">{u.name}</span>
                                            <span className="text-xs text-brown/40 ml-auto">{u.email}</span>
                                        </label>
                                    ))}
                                    {allUsers.length === 0 && (
                                        <p className="text-xs text-brown/40">No users found</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Row 4: Expiry + Usage + Active */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Usage Limit</label>
                                <input
                                    type="number"
                                    value={form.usageLimit}
                                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                                    className="input-field"
                                    placeholder="Unlimited"
                                    min="1"
                                />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-wheat text-olive focus:ring-olive"
                                    />
                                    <span className="text-sm text-brown font-medium">Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-olive text-ivory px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors disabled:opacity-60"
                            >
                                {submitting ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl font-medium text-sm border border-wheat text-brown hover:bg-wheat/50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
                    ))}
                </div>
            ) : coupons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FiTag className="mx-auto text-brown/20 mb-3" size={40} />
                    <p className="text-brown/50 text-sm">No coupons yet. Create your first coupon!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon._id}
                            className={`bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow ${!coupon.isActive ? "opacity-60" : ""}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${coupon.type === "percent" ? "bg-olive/10" : "bg-gold/20"}`}>
                                        {coupon.type === "percent" ? (
                                            <FiPercent className="text-olive" size={18} />
                                        ) : (
                                            <span className="text-gold font-bold text-sm">₹</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono font-bold text-olive text-sm">{coupon.code}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${coupon.isActive ? "bg-olive/10 text-olive" : "bg-red-50 text-red-500"}`}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[coupon.category] || categoryColors.general}`}>
                                                {categoryLabels[coupon.category] || coupon.category}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${targetColors[coupon.target] || targetColors.all}`}>
                                                {coupon.target === "specificUsers" ? (
                                                    <>{targetLabels.specificUsers} ({coupon.targetUsers?.length || 0})</>
                                                ) : (
                                                    targetLabels[coupon.target] || coupon.target
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-xs text-brown/50 mt-0.5">
                                            {coupon.type === "percent"
                                                ? `${coupon.value}% off`
                                                : `₹${coupon.value} off`}
                                            {coupon.minOrder > 0 && ` · Min ₹${coupon.minOrder}`}
                                            {coupon.maxDiscount && ` · Max ₹${coupon.maxDiscount}`}
                                        </p>
                                        {coupon.description && (
                                            <p className="text-xs text-brown/40 mt-0.5">{coupon.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-brown/40 mr-1">
                                        Used: {coupon.usedCount || 0}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                                    </span>
                                    {coupon.expiresAt && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${new Date(coupon.expiresAt) < new Date() ? "bg-red-50 text-red-500" : "bg-wheat text-brown/60"}`}>
                                            {new Date(coupon.expiresAt) < new Date()
                                                ? "Expired"
                                                : `Exp: ${new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                        </span>
                                    )}
                                    <button onClick={() => toggleActive(coupon)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${coupon.isActive ? "bg-olive/10 text-olive hover:bg-olive/20" : "bg-wheat text-brown/40 hover:bg-wheat/70"}`} title={coupon.isActive ? "Deactivate" : "Activate"}>
                                        <FiCheck size={14} />
                                    </button>
                                    <button onClick={() => openEdit(coupon)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit">
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(coupon._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
