import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/AuthContext";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  useEffect(() => {
    refreshSession().then((user) => {
      if (!user) return navigate("/login", { replace: true });
      if (user.role === "ADMIN") navigate("/admin", { replace: true });
      else if (["COMPANY", "COMPANY_ADMIN", "COMPANY_USER"].includes(user.role)) navigate("/company", { replace: true });
      else navigate("/feed", { replace: true });
    });
  }, [navigate, refreshSession]);
  return <div>Iniciando sesión con Google...</div>;
}
