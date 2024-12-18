"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./styles/friendRequest.css";

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
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`
        );
        setUser(data);
      } catch (err: any) {
        setError("Error al cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleAcceptRequest = async (requestId: string, username: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/accept/${userId}`,
        { friendId: requestId }
      );
      Swal.fire(
        "Solicitud aceptada",
        `${username} es ahora tu amigo.`,
        "success"
      );
      setUser((prev) => ({
        ...prev!,
        incomingRequests: prev!.incomingRequests.filter(
          (req) => req._id !== requestId
        ),
        friends: [...prev!.friends, { _id: requestId, username }],
      }));
    } catch {
      Swal.fire("Error", "No se pudo aceptar la solicitud.", "error");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/reject/${userId}`,
        { friendId: requestId }
      );
      Swal.fire("Solicitud rechazada", "Has rechazado la solicitud.", "info");
      setUser((prev) => ({
        ...prev!,
        incomingRequests: prev!.incomingRequests.filter(
          (req) => req._id !== requestId
        ),
      }));
    } catch {
      Swal.fire("Error", "No se pudo rechazar la solicitud.", "error");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/remove/${userId}`,
        { friendId }
      );
      Swal.fire("Amigo eliminado", "Has eliminado a este amigo.", "info");
      setUser((prev) => ({
        ...prev!,
        friends: prev!.friends.filter((friend) => friend._id !== friendId),
      }));
    } catch {
      Swal.fire("Error", "No se pudo eliminar al amigo.", "error");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="friend-container">
      <h2>Solicitudes de Amistad</h2>

      {/* Solicitudes Entrantes */}
      <h3>Solicitudes Entrantes</h3>
      {user?.incomingRequests.length ? (
        <ul className="friend-list">
          {user.incomingRequests.map((req) => (
            <li key={req._id} className="friend-item">
              <span>{req.username}</span>
              <div>
                <button
                  onClick={() => handleAcceptRequest(req._id, req.username)}
                  className="friend-button accept"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleRejectRequest(req._id)}
                  className="friend-button reject"
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes solicitudes pendientes.</p>
      )}

      {/* Amigos */}
      <h3>Amigos</h3>
      {user?.friends.length ? (
        <ul className="friend-list">
          {user.friends.map((friend) => (
            <li key={friend._id} className="friend-item">
              <span>{friend.username}</span>
              <button
                onClick={() => handleRemoveFriend(friend._id)}
                className="friend-button remove"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes amigos.</p>
      )}

      {/* Solicitudes Enviadas */}
      <h3>Solicitudes Enviadas</h3>
      {user?.outgoingRequests.length ? (
        <ul className="friend-list">
          {user.outgoingRequests.map((req) => (
            <li key={req._id} className="friend-item">
              <span>{req.username}</span>
              <span>Solicitud Enviada</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No has enviado solicitudes.</p>
      )}
    </div>
  );
};

export default FriendRequests;
