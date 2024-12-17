"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/createGroup.css";
type Friend = {
  _id: string;
  username: string;
};

const CreateGroup = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Obtener los datos del usuario logeado y sus amigos
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`
        );

        // Usamos el campo `friends` del usuario logeado
        setFriends(data.friends);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "No se pudo cargar la lista de amigos."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Manejar selección de amigos
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Manejar la creación del grupo
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("El nombre del grupo no puede estar vacío.");
      return;
    }
    if (selectedFriends.length === 0) {
      setError("Debes seleccionar al menos un amigo para crear el grupo.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    selectedFriends.push(userId); // Agregar al usuario logeado al grupo

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/groups/create`,
        {
          name: groupName,
          members: selectedFriends,
          createdBy: username,
        }
      );
      setSuccess(`Grupo "${data.name}" creado exitosamente.`);
      setGroupName("");
      setSelectedFriends([]);
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear el grupo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Crear Grupo</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div>
        <label htmlFor="groupName">Nombre del Grupo</label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
      </div>

      <h3>Selecciona Amigos</h3>
      {loading ? (
        <p>Cargando amigos...</p>
      ) : friends.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {friends.map((friend) => (
            <li
              key={friend._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
                borderBottom: "1px solid #ccc",
              }}
            >
              <span>{friend.username}</span>
              <input
                type="checkbox"
                checked={selectedFriends.includes(friend._id)}
                onChange={() => toggleFriendSelection(friend._id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes amigos disponibles.</p>
      )}

      <button
        onClick={handleCreateGroup}
        disabled={loading}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Creando..." : "Crear Grupo"}
      </button>
    </div>
  );
};

export default CreateGroup;
