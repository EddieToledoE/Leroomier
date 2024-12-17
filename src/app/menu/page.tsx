"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ExpenseList from "../../../components/expenseList";
import GroupList from "../../../components/groupSelector";
export default function Menu() {
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      setUser(session.user?.name || "");
      setUserId(session.user?.id || "");
      setUsername(session.user?.username || "");
    }
  }, [status, session]);

  return (
    <div>
      <h2> Bienvenido {user}</h2>
      <GroupList userId={userId} username={username} />
      <ExpenseList userId={userId} />
    </div>
  );
}
