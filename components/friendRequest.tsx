"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type UserRequest = {
  _id: string;
  username: string;
};

type User = {
  incomingRequests: UserRequest[];
  outgoingRequests: UserRequest[];
  friends: UserRequest[];
};

const FriendRequests = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return; // No hacer la solicitud si `userId` es undefined

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`
        );
        setUser(data);
      } catch (err: any) {
        setError(err.response?.data?.error || "No se pudo cargar el usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Solo se ejecuta cuando `userId` cambia

  const handleAcceptRequest = async (
    requestUsername: string,
    requestId: string
  ) => {
    console.log("userId:", userId); // Depura el userId
    console.log("requestId:", requestId); // Depura el requestId

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/accept/${userId}`,
        { friendId: requestId }
      );
      alert("Solicitud aceptada.");
      setUser((prev) => ({
        ...prev!,
        incomingRequests: prev!.incomingRequests.filter(
          (req) => req._id !== requestId
        ),
        friends: [
          ...prev!.friends,
          { _id: requestId, username: requestUsername },
        ],
      }));
    } catch (err: any) {
      alert(err.response?.data?.error || "No se pudo aceptar la solicitud.");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/reject/${userId}`,
        { friendId: requestId }
      );
      alert("Solicitud rechazada.");
      setUser((prev) => ({
        ...prev!,
        incomingRequests: prev!.incomingRequests.filter(
          (req) => req._id !== requestId
        ),
      }));
    } catch (err: any) {
      alert(err.response?.data?.error || "No se pudo rechazar la solicitud.");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Solicitudes de Amistad</h2>

      {/* Solicitudes Entrantes */}
      <h3>Solicitudes Entrantes</h3>
      {user?.incomingRequests.length ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {user.incomingRequests.map((req) => (
            <li
              key={req._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
                borderBottom: "1px solid #ccc",
              }}
            >
              <span>{req.username}</span>
              <span>{req._id}</span>
              <div>
                <button
                  onClick={() => handleAcceptRequest(req.username, req._id)}
                  style={{
                    marginRight: "0.5rem",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    padding: "0.3rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleRejectRequest(req._id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "0.3rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes solicitudes entrantes.</p>
      )}

      {/* Solicitudes Enviadas */}
      <h3>Solicitudes Enviadas</h3>
      {user?.outgoingRequests.length ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {user.outgoingRequests.map((req) => (
            <li
              key={req._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
                borderBottom: "1px solid #ccc",
              }}
            >
              <span>{req.username}</span>
              <span>Enviada</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No has enviado solicitudes.</p>
      )}

      {/* Amigos */}
      <h3>Amigos</h3>
      {user?.friends.length ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {user.friends.map((friend) => (
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
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes amigos.</p>
      )}
    </div>
  );
};

export default FriendRequests;
