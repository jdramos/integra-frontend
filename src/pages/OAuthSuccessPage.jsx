import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../auth/AuthContext";

export default function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();

  useEffect(() => {
    console.log("OAUTH PAGE ABIERTA");

    const token = params.get("token");
    const rawUser = params.get("user");

    console.log("TOKEN:", token);
    console.log("RAW USER:", rawUser);

    if (!token || !rawUser) {
      console.log("FALTA TOKEN O USER");
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(rawUser));

      console.log("USER PARSEADO:", user);

      loginWithOAuth({ token, user });

      console.log("LOCAL TOKEN:", localStorage.getItem("token"));
      console.log("LOCAL USER:", localStorage.getItem("user"));

      if (user.role === "COMPANY_ADMIN") navigate("/company");
      else if (user.role === "ADMIN") navigate("/admin");
      else navigate("/feed");
    } catch (error) {
      console.error("ERROR EN OAUTH SUCCESS:", error);
      navigate("/login");
    }
  }, [params, navigate, loginWithOAuth]);

  return <div>Iniciando sesión con Google...</div>;
}