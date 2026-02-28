import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiPackage,
    FiHeart,
    FiTruck,
    FiCheck,
    FiShoppingBag,
    FiArrowRight,
    FiSettings,
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const UserDashboard = () => {
    const { user } = useAuth();
    const { getWishlistCount } = useWishlist();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get("/api/orders/myorders");
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const activeOrders = orders.filter((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled").length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered").length;

    const stats = [
        { label: "Total Orders", value: orders.length, icon: FiPackage, color: "bg-olive/10 text-olive" },
        { label: "Wishlist", value: getWishlistCount(), icon: FiHeart, color: "bg-red-50 text-red-500" },
        { label: "Active", value: activeOrders, icon: FiTruck, color: "bg-blue-50 text-blue-600" },
        { label: "Delivered", value: deliveredOrders, icon: FiCheck, color: "bg-gold/20 text-gold" },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-olive/10 to-gold/10 rounded-xl p-5 sm:p-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-brown">
                    Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
                </h2>
                <p className="text-brown/60 text-sm mt-1">
                    Here's what's happening with your orders
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        {loading ? (
                            <div className="h-8 bg-wheat/50 rounded animate-pulse mb-1" />
                        ) : (
                            <p className="text-2xl font-bold text-brown">{stat.value}</p>
                        )}
                        <p className="text-xs text-brown/60">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders + Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-display text-lg font-semibold text-brown">Recent Orders</h3>
                        <Link
                            to="/dashboard/orders"
                            className="text-sm text-olive font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View All <FiArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-14 bg-wheat/30 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8">
                            <FiPackage className="mx-auto text-brown/20 mb-3" size={36} />
                            <p className="text-brown/50 text-sm mb-3">No orders yet</p>
                            <Link to="/products" className="text-olive font-medium text-sm hover:underline">
                                Start Shopping →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 4).map((order) => (
                                <Link
                                    key={order._id}
                                    to={`/order-confirmation/${order._id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-ivory transition-colors"
                                >
                                    <div className="flex -space-x-2 flex-shrink-0">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <img
                                                key={idx}
                                                src={item.image}
                                                alt=""
                                                className="w-9 h-9 rounded-lg border-2 border-white object-cover bg-wheat"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-brown truncate">
                                            {order.items.map((i) => i.name).join(", ")}
                                        </p>
                                        <p className="text-xs text-brown/50">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN")} • ₹{order.totalPrice}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize ${order.orderStatus === "delivered"
                                            ? "bg-olive/10 text-olive"
                                            : order.orderStatus === "shipped"
                                                ? "bg-purple-50 text-purple-600"
                                                : "bg-gold/20 text-brown"
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="font-display text-lg font-semibold text-brown mb-5">Quick Links</h3>
                    <div className="space-y-3">
                        <Link
                            to="/products"
                            className="flex items-center gap-3 p-3 rounded-xl bg-olive/5 hover:bg-olive/10 transition-colors"
                        >
                            <div className="w-10 h-10 bg-olive/10 rounded-lg flex items-center justify-center">
                                <FiShoppingBag className="text-olive" size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brown">Browse Products</p>
                                <p className="text-xs text-brown/50">Explore our collection</p>
                            </div>
                        </Link>
                        <Link
                            to="/track-order"
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FiTruck className="text-blue-600" size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brown">Track Order</p>
                                <p className="text-xs text-brown/50">Check delivery status</p>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard/settings"
                            className="flex items-center gap-3 p-3 rounded-xl bg-gold/10 hover:bg-gold/20 transition-colors"
                        >
                            <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                                <FiSettings className="text-gold" size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brown">Settings</p>
                                <p className="text-xs text-brown/50">Profile & preferences</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
