import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Redirects /re to /re/dashboard */
const RERedirect = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/re/dashboard", { replace: true }); }, [navigate]);
  return null;
};

export default RERedirect;
