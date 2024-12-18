"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import SearchUsers from "../../../components/searchUsers";
import FriendRequests from "../../../components/friendRequest";

type UserRequest = {
  _id: string;
  username: string;
};

export default function Friends() {
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState("");
  const [friends, setFriends] = useState<UserRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<UserRequest[]>([]);
  const { data: session, status } = useSession();

  // Obtener datos del usuario autenticado
  useEffect(() => {
    if (status === "authenticated") {
      setUser(session.user?.name || "");
      setUserId(session.user?.id || "");

      const fetchUserData = async () => {
        try {
          const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${session.user?.id}`
          );
          setFriends(data.friends || []);
          setOutgoingRequests(data.outgoingRequests || []);
        } catch (err) {
          console.error("Error al cargar datos del usuario.");
        }
      };

      fetchUserData();
    }
  }, [status, session]);

  return (
    <div>
      <h2>Bienvenido {user}</h2>
      <SearchUsers friends={friends} outgoingRequests={outgoingRequests} />
      <FriendRequests userId={userId} />
    </div>
  );
}
