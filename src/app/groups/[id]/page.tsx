"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import "@/styles/groupDetail.css";
import ExpenseListByGroup from "../../../../components/expensesByGroup";
import { useSession } from "next-auth/react";
type Group = {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  members: Array<{ _id: string; username: string }>;
};

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const { data: session } = useSession();
  // Cargar los detalles del grupo
  useEffect(() => {
    const fetchGroupDetails = async () => {
      setUserId(session?.user?.id || "");
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/groups/${id}`
        );
        setGroup(data);

        // Buscar el nombre del creador
        const creator = data.createdBy;
        setCreatorName(creator);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            "No se pudieron cargar los detalles del grupo."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  if (loading) return <p className="loading">Cargando detalles del grupo...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="group-detail">
      {group ? (
        <>
          <h2 className="group-name">{group.name}</h2>
          <p className="group-info">
            <strong>Creado por:</strong> {creatorName}
          </p>
          <p className="group-info">
            <strong>Fecha de creación:</strong>{" "}
            {new Date(group.createdAt).toLocaleDateString()}
          </p>
          <h3 className="members-title">Miembros</h3>
          <ul className="members-list">
            {group.members.map((member) => (
              <li key={member._id} className="member-item">
                {member.username}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Detalles no disponibles.</p>
      )}
      {group && (
        <ExpenseListByGroup
          groupId={group._id}
          groupMembers={group.members}
          userId={userId}
        />
      )}
    </div>
  );
};

export default GroupDetail;
