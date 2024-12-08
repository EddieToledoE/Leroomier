"use client";
import { useState } from "react";
import { signIn } from "next-auth/react"; // Usamos la función `signIn` de next-auth
import { useRouter } from "next/navigation";

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
      redirect: false, // Evitar redirección automática
      email,
      password,
    });

    if (result?.error) {
      setError(result.error); // Si hay error, mostramos el mensaje
      setIsLoading(false);
    } else {
      // Redirigir a la página principal o la que prefieras después de iniciar sesión
      router.push("/menu"); // O cualquier otra página a la que quieras redirigir
    }
  };

  const handleForgotPassword = () => {
    // Redirigir a la página de recuperación de contraseña
    router.push("/forgot-password");
  };

  return (
    <div>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}{" "}
        {/* Mostrar errores */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>

      <div>
        {/* Enlace o botón para redirigir a la página de recuperar contraseña */}
        <button onClick={handleForgotPassword} style={{ marginTop: "10px" }}>
          Olvidé mi contraseña
        </button>
      </div>
    </div>
  );
}
