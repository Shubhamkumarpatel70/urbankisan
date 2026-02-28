import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiPackage,
    FiShoppingBag,
    FiDollarSign,
    FiUsers,
    FiArrowRight,
    FiPlus,
    FiTrendingUp,
} from "react-icons/fi";
import axios from "axios";

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    axios.get("/api/orders/stats"),
                    axios.get("/api/orders"),
                ]);
                setStats(statsRes.data);
                setRecentOrders(ordersRes.data.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeOrders = recentOrders.filter((o) => o.orderStatus !== "delivered").length;

    const statCards = [
        {
            label: "Total Products",
            value: stats.totalProducts.toString(),
            icon: FiShoppingBag,
            color: "bg-olive/10 text-olive",
        },
        {
            label: "Total Orders",
            value: stats.totalOrders.toString(),
            icon: FiPackage,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: FiDollarSign,
            color: "bg-gold/20 text-gold",
        },
        {
            label: "Customers",
            value: stats.totalCustomers.toString(),
            icon: FiUsers,
            color: "bg-purple-50 text-purple-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown">
                        Admin Dashboard
                    </h2>
                    <p className="text-brown/60 text-sm mt-1">Overview of your store performance</p>
                </div>
                <Link
                    to="/dashboard/products"
                    className="inline-flex items-center gap-2 bg-gold text-brown px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-gold/90 transition-colors active:scale-95"
                >
                    <FiPlus size={16} /> Add Product
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} />
                            </div>
                            <FiTrendingUp className="text-olive" size={16} />
                        </div>
                        {loading ? (
                            <div className="h-8 bg-wheat/50 rounded animate-pulse mb-1" />
                        ) : (
                            <p className="text-2xl sm:text-3xl font-bold text-brown">{stat.value}</p>
                        )}
                        <p className="text-xs text-brown/60 mt-1">{stat.label}</p>
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
                                <div key={i} className="h-12 bg-wheat/30 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-brown/50 text-sm py-8 text-center">No orders yet</p>
                    ) : (
                        <div className="overflow-x-auto -mx-5">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-wheat text-left">
                                        <th className="pb-3 pl-5 text-xs font-medium text-brown/50 uppercase">Order ID</th>
                                        <th className="pb-3 text-xs font-medium text-brown/50 uppercase">Customer</th>
                                        <th className="pb-3 text-xs font-medium text-brown/50 uppercase">Total</th>
                                        <th className="pb-3 pr-5 text-xs font-medium text-brown/50 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-wheat/50 last:border-0">
                                            <td className="py-3 pl-5">
                                                <span className="text-sm font-mono font-medium text-olive">
                                                    {order.orderId || order._id.slice(-8)}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-brown">
                                                {order.user?.name || "Customer"}
                                            </td>
                                            <td className="py-3 text-sm font-medium text-brown">₹{order.totalPrice}</td>
                                            <td className="py-3 pr-5">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${order.orderStatus === "delivered"
                                                        ? "bg-olive/10 text-olive"
                                                        : order.orderStatus === "shipped"
                                                            ? "bg-blue-50 text-blue-600"
                                                            : order.orderStatus === "outForDelivery"
                                                                ? "bg-orange-50 text-orange-600"
                                                                : "bg-gold/20 text-brown"
                                                    }`}>
                                                    {order.orderStatus === "outForDelivery" ? "Out for Delivery" : order.orderStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="font-display text-lg font-semibold text-brown mb-5">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link
                            to="/dashboard/products"
                            className="flex items-center gap-3 p-3 rounded-xl bg-olive/5 hover:bg-olive/10 transition-colors"
                        >
                            <div className="w-10 h-10 bg-olive/10 rounded-lg flex items-center justify-center">
                                <FiShoppingBag className="text-olive" size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brown">Manage Products</p>
                                <p className="text-xs text-brown/50">Add, edit or remove</p>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard/orders"
                            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FiPackage className="text-blue-600" size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brown">Manage Orders</p>
                                <p className="text-xs text-brown/50">{activeOrders} active orders</p>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard/customers"
                            className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <FiUsers className="text-purple-600" size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brown">View Customers</p>
                                <p className="text-xs text-brown/50">{stats.totalCustomers} registered</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
