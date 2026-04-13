import { Navigate } from "react-router-dom";

/** Redirects /admin to /admin/dashboard */
const AdminRedirect = () => <Navigate to="/admin/dashboard" replace />;
export default AdminRedirect;
