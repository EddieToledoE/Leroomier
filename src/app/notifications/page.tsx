"use client";
import { useEffect, useState } from "react";
import Notifications from "../../../components/notifications";
import { useSession } from "next-auth/react";

const NotificationsPage = () => {
  const { data: session, status } = useSession(); // status indica el estado de la sesión
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  if (status === "loading") {
    return <p>Cargando...</p>; // Mostrar mensaje de carga mientras se obtiene la sesión
  }

  if (!session) {
    return <p>No has iniciado sesión.</p>; // Mensaje si el usuario no está autenticado
  }

  return <Notifications userId={userId} />;
};

export default NotificationsPage;
