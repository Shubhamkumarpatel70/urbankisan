import { useState, useEffect } from "react";
import { FiSend, FiTrash2, FiBell, FiX, FiUsers, FiUser } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const typeOptions = [
    { value: "info", label: "ℹ️ Info", color: "bg-blue-50 text-blue-600" },
    { value: "promo", label: "🏷️ Promo", color: "bg-olive/10 text-olive" },
    { value: "order", label: "📦 Order", color: "bg-gold/20 text-gold" },
    { value: "alert", label: "⚠️ Alert", color: "bg-red-50 text-red-500" },
    { value: "festival", label: "🎉 Festival", color: "bg-orange-50 text-orange-600" },
];

const AdminNotifications = () => {
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        message: "",
        type: "info",
        target: "all",
        targetUsers: [],
    });

    useEffect(() => {
        fetchNotifications();
        fetchUsers();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get("/api/notifications/all");
            setNotifications(data);
        } catch (error) {
            console.error("Error:", error);
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

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            addToast("Title and message are required", "error");
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await axios.post("/api/notifications", {
                ...form,
                targetUsers: form.target === "specificUsers" ? form.targetUsers : [],
            });
            setNotifications((prev) => [data, ...prev]);
            addToast("Notification sent! 🔔", "success");
            setForm({ title: "", message: "", type: "info", target: "all", targetUsers: [] });
            setShowForm(false);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to send", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this notification?")) return;
        try {
            await axios.delete(`/api/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            addToast("Notification deleted", "success");
        } catch (error) {
            addToast("Failed to delete", "error");
        }
    };

    const toggleUser = (uid) => {
        setForm((prev) => ({
            ...prev,
            targetUsers: prev.targetUsers.includes(uid)
                ? prev.targetUsers.filter((id) => id !== uid)
                : [...prev.targetUsers, uid],
        }));
    };

    const typeColor = (t) => typeOptions.find((o) => o.value === t)?.color || "bg-wheat text-brown";
    const typeLabel = (t) => typeOptions.find((o) => o.value === t)?.label || t;

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-2xl font-bold text-brown">Push Notifications</h2>
                    <p className="text-brown/60 text-sm mt-1">{notifications.length} sent</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-olive text-ivory px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-all active:scale-95"
                >
                    <FiSend size={16} /> Compose Notification
                </button>
            </div>

            {/* Compose Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-5 border-2 border-olive/20 animate-fadeIn">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-display font-semibold text-brown">📢 Send Notification</h3>
                        <button onClick={() => setShowForm(false)} className="text-brown/40 hover:text-brown">
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="input-field"
                                placeholder="e.g. 🌿 New Organic Collection!"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Message *</label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                className="input-field min-h-[80px] resize-y"
                                placeholder="Check out our fresh arrivals..."
                                rows={3}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {typeOptions.map((opt) => (
                                        <button
                                            type="button"
                                            key={opt.value}
                                            onClick={() => setForm({ ...form, type: opt.value })}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.type === opt.value
                                                ? `${opt.color} ring-2 ring-offset-1 ring-current scale-105`
                                                : "bg-wheat text-brown/60 hover:bg-wheat/70"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Send To</label>
                                <select
                                    value={form.target}
                                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="all">🌍 All Users</option>
                                    <option value="specificUsers">👤 Specific Users</option>
                                </select>
                            </div>
                        </div>

                        {/* User picker */}
                        {form.target === "specificUsers" && (
                            <div className="bg-ivory rounded-xl p-4">
                                <label className="block text-sm font-medium text-brown mb-2">
                                    Select Users ({form.targetUsers.length} selected)
                                </label>
                                <div className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar">
                                    {allUsers.map((u) => (
                                        <label key={u._id} className="flex items-center gap-2 cursor-pointer hover:bg-wheat/50 p-1.5 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={form.targetUsers.includes(u._id)}
                                                onChange={() => toggleUser(u._id)}
                                                className="w-3.5 h-3.5 rounded border-wheat text-olive focus:ring-olive"
                                            />
                                            <span className="text-sm text-brown">{u.name}</span>
                                            <span className="text-xs text-brown/40 ml-auto">{u.email}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-olive text-ivory px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors disabled:opacity-60"
                            >
                                <FiSend size={14} />
                                {submitting ? "Sending..." : "Send Notification"}
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

            {/* Sent Notifications */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FiBell className="mx-auto text-brown/20 mb-3" size={40} />
                    <p className="text-brown/50 text-sm">No notifications sent yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div key={n._id} className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColor(n.type)}`}>
                                            {typeLabel(n.type)}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${n.target === "all" ? "bg-olive/10 text-olive" : "bg-purple-50 text-purple-600"}`}>
                                            {n.target === "all" ? "All Users" : `${n.targetUsers?.length || 0} Users`}
                                        </span>
                                        <span className="text-[10px] text-brown/40">{timeAgo(n.createdAt)}</span>
                                    </div>
                                    <h4 className="font-semibold text-brown text-sm">{n.title}</h4>
                                    <p className="text-xs text-brown/60 mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-brown/30 mt-1">Sent by {n.sentBy?.name || "Admin"}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(n._id)}
                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;
