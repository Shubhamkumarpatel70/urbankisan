import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheck, FiPackage, FiCopy } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../components/Toast";

const OrderConfirmation = () => {
    const { id } = useParams();
    const { addToast } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`/api/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const copyOrderId = () => {
        const oid = order?.orderId || order?._id;
        navigator.clipboard.writeText(oid);
        addToast("Order ID copied!", "success");
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <div className="w-20 h-20 bg-wheat/50 rounded-full mx-auto mb-4 animate-pulse" />
                    <div className="h-6 bg-wheat/50 rounded w-1/2 mx-auto animate-pulse mb-2" />
                    <div className="h-4 bg-wheat/50 rounded w-1/3 mx-auto animate-pulse" />
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
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm text-center mb-6 animate-fadeIn">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-scaleIn">
                    <FiCheck className="text-olive" size={40} />
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-2">
                    Order Confirmed! 🎉
                </h1>
                <p className="text-brown/60 mb-4">
                    Thank you for your order. We'll notify you when it's shipped.
                </p>

                <div className="bg-ivory rounded-xl p-4 mb-6">
                    <p className="text-xs text-brown/50 mb-1">Order ID</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="font-mono font-bold text-olive text-lg">{displayId}</p>
                        <button
                            onClick={copyOrderId}
                            className="w-7 h-7 rounded-lg bg-olive/10 text-olive flex items-center justify-center hover:bg-olive/20 transition-colors"
                            title="Copy Order ID"
                        >
                            <FiCopy size={14} />
                        </button>
                    </div>
                </div>

                {/* Order Details */}
                <div className="text-left space-y-4">
                    <h3 className="font-display font-semibold text-brown">Order Items</h3>
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-ivory/50 p-3 rounded-xl">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 rounded-lg object-cover bg-wheat"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-brown truncate">{item.name}</p>
                                <p className="text-xs text-brown/50">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-brown">₹{item.price * item.quantity}</p>
                        </div>
                    ))}

                    {/* Summary */}
                    <div className="border-t border-wheat pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-brown/60">Items Total</span>
                            <span className="text-brown">₹{order.itemsPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-brown/60">Shipping</span>
                            <span className={order.shippingPrice === 0 ? "text-olive" : "text-brown"}>
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
                        <div className="bg-ivory rounded-xl p-4">
                            <p className="text-xs text-brown/50 mb-1">Shipping Address</p>
                            {order.shippingAddress.fullName && (
                                <p className="text-sm font-medium text-brown">{order.shippingAddress.fullName}</p>
                            )}
                            <p className="text-sm text-brown/70">
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                            {order.shippingAddress.phone && (
                                <p className="text-xs text-brown/50 mt-1">📞 {order.shippingAddress.phone}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    to={`/track-order?id=${displayId}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-olive text-ivory px-6 py-3 rounded-xl font-medium hover:bg-olive/90 transition-colors"
                >
                    <FiPackage size={16} /> Track Order
                </Link>
                <Link
                    to="/products"
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-olive text-olive px-6 py-3 rounded-xl font-medium hover:bg-olive hover:text-ivory transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmation;
