"use client";

import { useTheme } from "./themeContext"; // Tu contexto de tema

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme(); // Accede al contexto de tema

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        backgroundColor: theme === "light" ? "#333" : "#fff",
        color: theme === "light" ? "#fff" : "#333",
      }}
    >
      {theme === "light" ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
    </button>
  );
};

export default ThemeToggle;
