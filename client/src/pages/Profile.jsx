import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiLogOut,
  FiArrowRight,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useOrder } from "../context/OrderContext";
import { useWishlist } from "../context/WishlistContext";

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { orders } = useOrder();
  const { getWishlistCount } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="section-padding">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-20 h-20 bg-wheat rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="text-brown/40" size={40} />
          </div>
          <h2 className="font-display text-3xl font-bold text-brown mb-4">
            Sign In Required
          </h2>
          <p className="text-brown/70 mb-8">
            Please sign in to view your profile and orders.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2"
          >
            Sign In <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-olive rounded-full flex items-center justify-center shadow-lg shadow-olive/30">
              <span className="text-ivory font-display font-bold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown">
                {user.name}
              </h1>
              <p className="text-brown/70 flex items-center justify-center sm:justify-start gap-2 mt-1">
                <FiMail size={14} /> {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-wheat rounded-lg text-brown/70 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Orders",
              value: orders.length,
              icon: FiPackage,
              link: "#orders",
              color: "olive",
            },
            {
              label: "Wishlist",
              value: getWishlistCount(),
              icon: FiHeart,
              link: "/wishlist",
              color: "gold",
            },
            {
              label: "Active",
              value: orders.filter((o) => o.orderStatus !== "delivered").length,
              icon: FiClock,
              link: "/track-order",
              color: "olive",
            },
            {
              label: "Delivered",
              value: orders.filter((o) => o.orderStatus === "delivered").length,
              icon: FiMapPin,
              link: "#orders",
              color: "olive",
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center"
            >
              <stat.icon
                className={`mx-auto mb-2 text-${stat.color}`}
                size={24}
              />
              <p className="text-2xl font-bold text-brown">{stat.value}</p>
              <p className="text-sm text-brown/60">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/wishlist"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
              <FiHeart className="text-gold" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-brown">My Wishlist</p>
              <p className="text-xs text-brown/60">
                {getWishlistCount()} saved items
              </p>
            </div>
            <FiArrowRight className="text-brown/40" />
          </Link>

          <Link
            to="/track-order"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
              <FiPackage className="text-olive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-brown">Track Order</p>
              <p className="text-xs text-brown/60">Check delivery status</p>
            </div>
            <FiArrowRight className="text-brown/40" />
          </Link>

          <Link
            to="/products"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-wheat rounded-full flex items-center justify-center">
              <FiMapPin className="text-brown" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-brown">Shop More</p>
              <p className="text-xs text-brown/60">Browse products</p>
            </div>
            <FiArrowRight className="text-brown/40" />
          </Link>
        </div>

        {/* Order History */}
        <div id="orders">
          <h2 className="font-display text-2xl font-bold text-brown mb-4">
            Order History
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FiPackage className="mx-auto text-brown/30 mb-4" size={48} />
              <p className="text-brown/70 mb-4">No orders yet</p>
              <Link
                to="/products"
                className="text-olive font-medium hover:underline"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm text-brown/60">Order ID</p>
                      <p className="font-bold text-olive font-mono text-sm">
                        {order.orderId || order._id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${
                          order.orderStatus === "delivered"
                            ? "bg-olive/10 text-olive"
                            : order.orderStatus === "shipped"
                              ? "bg-blue-50 text-blue-600"
                              : order.orderStatus === "cancelled"
                                ? "bg-red-50 text-red-500"
                                : "bg-gold/20 text-brown"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span className="text-sm text-brown/60">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-wheat flex-shrink-0"
                      />
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-wheat flex items-center justify-center text-sm text-brown/60 flex-shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                    <div className="flex-1" />
                    <span className="text-lg font-bold text-brown whitespace-nowrap">
                      ₹{order.totalPrice}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      to={`/track-order?id=${order.orderId || order._id}`}
                      className="text-sm px-4 py-2 bg-olive/10 text-olive rounded-lg font-medium hover:bg-olive/20 transition-colors"
                    >
                      Track Order
                    </Link>
                    <Link
                      to={`/order-confirmation/${order._id}`}
                      className="text-sm px-4 py-2 bg-wheat text-brown rounded-lg font-medium hover:bg-wheat/70 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
