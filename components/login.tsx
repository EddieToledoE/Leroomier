"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./themeToggle"; // Botón para cambiar tema
import "./styles/login.css"; // Archivo CSS para estilos específicos del login

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/menu");
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <div className="login-container">
      <ThemeToggle /> {/* Botón para alternar tema */}
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
      <button onClick={handleForgotPassword} className="forgot-password-button">
        Olvidé mi contraseña
      </button>
    </div>
  );
}
