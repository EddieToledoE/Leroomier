"use client";

import { useState } from "react";
import axios from "axios";
import "@/styles/forgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      setMessage(response.data.message);
      setError(null);
    } catch (err: any) {
      setMessage(null);
      setError(err.response?.data?.error || "Ocurrió un error inesperado");
    }
  };

  return (
    <div className="forgot-password-container">
      <h1 className="forgot-password-title">Recupera tu contraseña</h1>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="forgot-password-error">{error}</p>}
        {message && <p className="forgot-password-message">{message}</p>}

        <button type="submit" className="forgot-password-button">
          Enviar enlace de recuperación
        </button>
      </form>
    </div>
  );
}
