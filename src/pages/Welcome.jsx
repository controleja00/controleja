import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// /welcome redireciona para a landing principal
export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      navigate(auth ? "/dashboard" : "/", { replace: true });
    });
  }, []);

  return null;
}