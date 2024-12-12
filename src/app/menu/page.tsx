"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Menu() {
  const [user, setUser] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      setUser(session.user?.name || "");
    }
  }, [status, session]);

  return (
    <div>
      <h1>Menu</h1>
      <h2> Bienvenido {user}</h2>
      <button onClick={() => signOut()}>CERRAR SESIÓN</button>
    </div>
  );
}
