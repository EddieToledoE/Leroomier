"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/expenseList.css";
import CreateExpense from "./createExpense";

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
  createdAt: string;
};

type ExpenseUser = {
  _id: string;
  userId: { _id: string; username: string }; // Username del usuario
  amountOwed: number;
  paid: boolean;
};

const ExpenseListByGroup = ({
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
  const [showModal, setShowModal] = useState(false);
  const [expenseUsers, setExpenseUsers] = useState<ExpenseUser[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [loadingExpenseUsers, setLoadingExpenseUsers] = useState(false);

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

  // Obtener expenseUser por expenseId
  const fetchExpenseUsers = async (expense: Expense) => {
    setLoadingExpenseUsers(true);
    setSelectedExpense(expense);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/expenseuser/expenseid/${expense._id}`
      );
      setExpenseUsers(data);
    } catch (err: any) {
      setError("No se pudieron cargar los detalles del gasto.");
    } finally {
      setLoadingExpenseUsers(false);
      setShowModal(true);
    }
  };

  return (
    <div className="expense-list-container">
      <h2 className="expense-list-title">Gastos del Grupo</h2>
      {loading && <p className="expense-list-loading">Cargando gastos...</p>}
      {error && <p className="expense-list-error">{error}</p>}

      <div className="expense-list-grid">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="expense-card"
            onClick={() => fetchExpenseUsers(expense)}
            style={{ cursor: "pointer" }}
          >
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

      {/* Modal para expenseUsers */}
      {showModal && selectedExpense && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <h2>Detalles del Gasto: {selectedExpense.description}</h2>
            {loadingExpenseUsers ? (
              <p>Cargando detalles...</p>
            ) : (
              <ul className="expense-user-list">
                {expenseUsers.map((user) => (
                  <li key={user._id} className="expense-user-item">
                    <p>
                      <strong>Usuario:</strong> {user.userId.username}
                    </p>
                    <p>
                      <strong>Monto Deudado:</strong> $
                      {user.amountOwed.toFixed(2)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {user.paid ? "Pagado" : "Pendiente"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseListByGroup;
