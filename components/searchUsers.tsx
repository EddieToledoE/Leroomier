"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import "./styles/searchUsers.css";

type User = {
  _id: string;
  username: string;
};

type SearchUsersProps = {
  friends: User[];
  outgoingRequests: User[];
};

const SearchUsers = ({ friends, outgoingRequests }: SearchUsersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      setUserId(session.user?.id || "");
    }
  }, [status, session]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/search`,
        { params: { username: searchTerm } }
      );

      setResults(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al realizar la búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/friend/request/${userId}`,
        { friendId }
      );
      alert("Solicitud de amistad enviada.");
    } catch (err: any) {
      alert(err.response?.data?.error || "No se pudo enviar la solicitud.");
    }
  };

  const isFriendOrPending = (id: string) =>
    friends.some((friend) => friend._id === id) ||
    outgoingRequests.some((req) => req._id === id);

  return (
    <div className="friend-container">
      <h2>Buscar Usuarios</h2>
      <input
        type="text"
        placeholder="Buscar por nombre de usuario"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="friend-input"
      />
      <button
        onClick={handleSearch}
        className="friend-button search"
        disabled={loading}
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul className="friend-list">
        {results.map((user) => (
          <li key={user._id} className="friend-item">
            <span>{user.username}</span>
            {isFriendOrPending(user._id) ? (
              <button className="friend-button disabled" disabled>
                Ya enviado
              </button>
            ) : (
              <button
                onClick={() => handleAddFriend(user._id)}
                className="friend-button accept"
              >
                Agregar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;
