"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dotenv from "dotenv";
import { useSession } from "next-auth/react";
dotenv.config();

type User = {
  _id: string;
  username: string;
};

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [user, setUser] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      setUser(session.user?.id || "");
    }
  }, [status, session]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/search`,
        {
          params: { username: searchTerm }, // Parámetros de búsqueda
        }
      );

      setResults(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Hubo un problema con la búsqueda."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/request/${user}`,
        {
          friendId: friendId, // ID del amigo a agregar
        }
      );

      alert("Solicitud de amistad enviada exitosamente.");
    } catch (err: any) {
      alert(err.response?.data?.error || "No se pudo enviar la solicitud.");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "auto" }}>
      <h2>Buscar usuarios</h2>
      <input
        type="text"
        placeholder="Buscar por username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
        {results.map((user) => (
          <li
            key={user._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem",
              borderBottom: "1px solid #ccc",
            }}
          >
            <span>{user.username}</span>
            <button
              onClick={() => handleAddFriend(user._id)}
              style={{
                padding: "0.3rem 0.5rem",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Agregar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;
