"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./themeToggle";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") {
      console.log(session);
      setUsername(session?.user?.username || "Usuario");
    }
  }, [status, session]);

  const handleSignOut = () => {
    // Restablecer tema al valor predeterminado (claro)
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    signOut(); // Cierra sesión y redirige al usuario
  };

  const handleRedirectMenu = () => {
    router.push("/menu");
  };

  const handleNotificacionts = () => {
    router.push("/notifications");
  };
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <h1
        onClick={handleRedirectMenu}
        style={{ margin: 0, fontSize: "1.5rem", color: "var(--color-text)" }}
      >
        LeRoomier
      </h1>
      <ThemeToggle />
      <h4 style={{ margin: "0 1rem", color: "var(--color-text)" }}>Amigos</h4>
      <h4
        onClick={handleNotificacionts}
        style={{ margin: "0 1rem", color: "var(--color-text)" }}
      >
        Notificaciones
      </h4>
      {username && (
        <button
          onClick={handleSignOut}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-bg)",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Adiós, {username}
        </button>
      )}
    </nav>
  );
};

export default Navbar;
