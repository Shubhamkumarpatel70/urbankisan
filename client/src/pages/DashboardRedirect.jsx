import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrders from "./admin/AdminOrders";
import UserDashboard from "./user/UserDashboard";
import UserOrders from "./user/UserOrders";

// This component renders the correct dashboard/orders page based on user role
const DashboardRedirect = ({ type }) => {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin;

    if (type === "orders") {
        return isAdmin ? <AdminOrders /> : <UserOrders />;
    }

    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default DashboardRedirect;
