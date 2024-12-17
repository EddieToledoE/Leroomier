"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import "@/styles/resetPassword.css"; // Importar estilos

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });

      setLoading(false);
      setSuccess(response.data.message);
      setError(null);

      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.error || "Hubo un error al procesar la solicitud"
      );
      setSuccess(null);
    }
  };

  return (
    <div className="reset-password-container">
      <h1 className="reset-password-title">Restablecer contraseña</h1>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="form-group">
          <label htmlFor="password">Nueva contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="reset-password-error">{error}</p>}
        {success && <p className="reset-password-success">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="reset-password-button"
        >
          {loading ? "Cargando..." : "Restablecer contraseña"}
        </button>
      </form>
    </div>
  );
}
