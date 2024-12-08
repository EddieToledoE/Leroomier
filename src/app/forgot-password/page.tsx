"use client";

import { useState } from "react";
import axios from "axios";

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
    <div>
      <h1>Recupera tu contraseña</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <button type="submit">Enviar enlace de recuperación</button>
      </form>
    </div>
  );
}
