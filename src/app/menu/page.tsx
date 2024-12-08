"use client";
import { signOut, useSession } from "next-auth/react";

export default function Menu() {
  const { data: session, status } = useSession();
  console.log(session);
  return (
    <div>
      <h1>Menu</h1>
      <button onClick={() => signOut()}>CERRAR SESIÓN</button>
    </div>
  );
}
