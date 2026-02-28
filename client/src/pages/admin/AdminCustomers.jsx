import { useState, useEffect } from "react";
import { FiMail, FiCalendar, FiShoppingBag } from "react-icons/fi";
import axios from "axios";

const colors = [
  "bg-olive",
  "bg-gold",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get("/api/users");
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const totalOrders = customers.reduce(
    (sum, c) => sum + (c.orderCount || 0),
    0,
  );
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-brown">
          Customers
        </h2>
        <p className="text-brown/60 text-sm mt-1">
          {customers.length} registered customers
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
          <p className="text-lg sm:text-2xl font-bold text-brown">
            {customers.length}
          </p>
          <p className="text-[10px] sm:text-xs text-brown/60">Customers</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
          <p className="text-lg sm:text-2xl font-bold text-brown">
            {totalOrders}
          </p>
          <p className="text-[10px] sm:text-xs text-brown/60">Orders</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
          <p className="text-lg sm:text-2xl font-bold text-olive">
            ₹{totalSpent.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-xs text-brown/60">Revenue</p>
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-brown/50 text-sm">No customers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {customers.map((customer, idx) => (
            <div
              key={customer._id}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 ${colors[idx % colors.length]} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-brown text-sm truncate">
                    {customer.name}
                  </p>
                  <p className="text-xs text-brown/50 truncate flex items-center gap-1">
                    <FiMail size={10} /> {customer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brown/60 flex items-center gap-1.5">
                    <FiShoppingBag size={12} /> Orders
                  </span>
                  <span className="font-medium text-brown">
                    {customer.orderCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brown/60">Total Spent</span>
                  <span className="font-medium text-olive">
                    ₹{(customer.totalSpent || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brown/60 flex items-center gap-1.5">
                    <FiCalendar size={12} /> Joined
                  </span>
                  <span className="text-brown/70 text-xs">
                    {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {customer.isAdmin && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold mt-1">
                    Admin
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
