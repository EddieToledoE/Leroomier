"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./styles/expenseList.css";
import CreateExpense from "./createExpense";
type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: Array<{
    userId: string;
    customAmountOwed: number;
  }>;
  createdAt: string;
};

const ExpenseList = ({
  groupId,
  groupMembers,
  userId,
}: {
  groupId: string;
  groupMembers: Array<{ _id: string; username: string }>;
  userId: string;
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Controla el modal

  // Obtener los gastos del grupo
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/expenses/group/${groupId}`
        );
        setExpenses(data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "No se pudo cargar la lista de gastos."
        );
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchExpenses();
    }
  }, [groupId]);

  return (
    <div className="expense-list-container">
      <h2 className="expense-list-title">Gastos del Grupo</h2>
      {loading && <p className="expense-list-loading">Cargando gastos...</p>}
      {error && <p className="expense-list-error">{error}</p>}

      <div className="expense-list-grid">
        {expenses.map((expense) => (
          <div key={expense._id} className="expense-card">
            <h3 className="expense-card-title">{expense.description}</h3>
            <p>
              <strong>Monto:</strong> ${expense.amount.toFixed(2)}
            </p>
            <p>
              <strong>Pagado por:</strong> {expense.paidBy}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(expense.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {/* Card para crear un nuevo gasto */}
        <div
          className="expense-card create-expense-card"
          onClick={() => setShowModal(true)}
        >
          <h3 className="expense-card-title">+ Crear Nuevo Gasto</h3>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <CreateExpense
              groupId={groupId}
              members={groupMembers}
              paidBy={userId} // Reemplazar con el ID del usuario autenticado
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
