"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./styles/groupSelector.css"; // Importar estilos
import CreateGroup from "./createGroup"; // Componente del formulario

type Group = {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

const GroupList = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Controla el modal
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/groups/user/${userId}`
        );
        setGroups(data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "No se pudo cargar la lista de grupos."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchGroups();
    }
  }, [userId]);

  const handleGroupClick = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="group-list-container">
      <h2 className="group-list-title">Mis Grupos</h2>
      {loading && <p className="group-list-loading">Cargando grupos...</p>}
      {error && <p className="group-list-error">{error}</p>}
      <div className="group-list-grid">
        {groups.map((group) => (
          <div
            key={group._id}
            className="group-card"
            onClick={() => handleGroupClick(group._id)}
          >
            <h3 className="group-card-title">{group.name}</h3>
            <p>
              <strong>Creado por:</strong> {group.createdBy}
            </p>
            <p>
              <strong>Fecha de creación:</strong>{" "}
              {new Date(group.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {/* Card para crear un nuevo grupo */}
        <div
          className="group-card create-group-card"
          onClick={() => setShowModal(true)}
        >
          <h3 className="group-card-title">+ Crear Nuevo Grupo</h3>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <CreateGroup userId={userId} username={username} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;
