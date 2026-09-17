import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { consuobra } from "@/api/consuobraClient";

// /welcome redireciona para a landing principal
export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    consuobra.auth.isAuthenticated().then(auth => {
      navigate(auth ? "/dashboard" : "/", { replace: true });
    });
  }, []);

  return null;
}