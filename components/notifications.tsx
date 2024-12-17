"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./styles/notifications.css";

type Notification = {
  _id: string;
  userId: string;
  receiverId: string;
  message: string;
  type: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
};

const Notifications = ({ userId }: { userId: string }) => {
  const [sentNotifications, setSentNotifications] = useState<Notification[]>(
    []
  );
  const [receivedNotifications, setReceivedNotifications] = useState<
    Notification[]
  >([]);
  const [readNotifications, setReadNotifications] = useState<Notification[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las notificaciones
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [sent, received] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/user/${userId}`
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/receiver/${userId}`
        ),
      ]);

      // Filtrar notificaciones leídas y no leídas
      const unreadReceived = received.data.filter(
        (notif: Notification) => !notif.read
      );
      const readReceived = received.data.filter(
        (notif: Notification) => notif.read
      );

      setSentNotifications(sent.data);
      setReceivedNotifications(unreadReceived);
      setReadNotifications(readReceived);
    } catch (err) {
      setError("Error al cargar las notificaciones.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Confirmar pago
  const handleConfirm = async (id: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/confirm/${id}`
      );
      Swal.fire(
        "Pago confirmado",
        "El pago ha sido confirmado exitosamente.",
        "success"
      );
      fetchNotifications(); // Actualizar notificaciones
    } catch (err) {
      Swal.fire("Error", "No se pudo confirmar el pago ." + err, "error");
    }
  };

  // Rechazar pago
  const handleReject = async (id: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/reject/${id}`
      );
      Swal.fire("Pago rechazado", "El pago ha sido rechazado.", "success");
      fetchNotifications(); // Actualizar notificaciones
    } catch (err) {
      Swal.fire("Error", "No se pudo rechazar el pago.", "error");
    }
  };

  // Marcar como leído
  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/read/${id}`
      );
      fetchNotifications(); // Actualizar notificaciones
    } catch (err) {
      Swal.fire(
        "Error",
        "No se pudo marcar la notificación como leída.",
        "error"
      );
    }
  };

  if (initialLoading) return <p>Esperando datos del usuario...</p>;
  if (loading) return <p>Cargando notificaciones...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="notifications-container">
      <h2>Mis Notificaciones</h2>

      {/* Notificaciones Recibidas */}
      <div className="notifications-section">
        <h3>Recibidas (No Leídas)</h3>
        {receivedNotifications.length > 0 ? (
          <ul>
            {receivedNotifications.map((notif) => (
              <li key={notif._id} className="notification-item">
                <p>{notif.message}</p>
                {notif.type === "NEW_PAYMENT" ? (
                  <div className="action-buttons">
                    <button
                      onClick={() => handleConfirm(notif.referenceId)}
                      className="confirm-button"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleReject(notif.referenceId)}
                      className="reject-button"
                    >
                      Rechazar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="mark-read-button"
                  >
                    Marcar como leído
                  </button>
                )}
                <p className="notification-date">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes notificaciones no leídas.</p>
        )}
      </div>

      {/* Notificaciones Leídas */}
      <div className="notifications-section">
        <h3>Recibidas (Leídas)</h3>
        {readNotifications.length > 0 ? (
          <ul>
            {readNotifications.map((notif) => (
              <li key={notif._id} className="notification-item">
                <p>{notif.message}</p>
                <p className="notification-date">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes notificaciones leídas.</p>
        )}
      </div>

      {/* Notificaciones Enviadas */}
      <div className="notifications-section">
        <h3>Enviadas</h3>
        {sentNotifications.length > 0 ? (
          <ul>
            {sentNotifications.map((notif) => (
              <li key={notif._id} className="notification-item">
                <p>{notif.message}</p>
                <p className="notification-date">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No has enviado notificaciones.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
