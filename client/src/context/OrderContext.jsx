import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validating, setValidating] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const { data } = await axios.get("/api/orders/myorders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const applyCoupon = async (code, cartTotal) => {
    if (!code.trim()) {
      return { success: false, message: "Please enter a coupon code" };
    }
    setValidating(true);
    try {
      const { data } = await axios.post("/api/coupons/validate", {
        code: code.toUpperCase(),
        cartTotal,
      });
      setAppliedCoupon(data);
      return { success: true, message: `Coupon applied! ${data.label}` };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid coupon code",
      };
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getDiscount = (cartTotal) => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      let disc = Math.round((cartTotal * appliedCoupon.value) / 100);
      if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
        disc = appliedCoupon.maxDiscount;
      }
      return disc;
    }
    return appliedCoupon.value;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        ordersLoading,
        fetchOrders,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getDiscount,
        validating,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
