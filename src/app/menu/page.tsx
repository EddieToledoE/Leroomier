"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SearchUsers from "../../../components/searchUsers";
import FriendRequests from "../../../components/friendRequest";
export default function Menu() {
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      setUser(session.user?.name || "");
      setUserId(session.user?.id || "");
    }
  }, [status, session]);

  return (
    <div>
      <h1>Menu</h1>
      <h2> Bienvenido {user}</h2>
      <SearchUsers />
      <FriendRequests userId={userId} />
      <button onClick={() => signOut()}>CERRAR SESIÓN</button>
    </div>
  );
}
