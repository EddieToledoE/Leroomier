"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./styles/expenseList.css";

type Expense = {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
};

type ExpenseUser = {
  _id: string;
  expenseId: Expense;
  amountOwed: number;
  initialAmount: number;
  paid: boolean;
};

const ExpenseList = ({ userId }: { userId: string }) => {
  const [expenses, setExpenses] = useState<ExpenseUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseUser | null>(
    null
  );
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/expenseuser/userid/${userId}`
        );
        setExpenses(data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "No se pudieron cargar los gastos."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

  const paidExpenses = expenses.filter((expense) => expense.paid);
  const pendingExpenses = expenses.filter((expense) => !expense.paid);

  const handleOpenModal = (expense: ExpenseUser) => {
    setSelectedExpense(expense);
    setAmount(expense.amountOwed);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedExpense(null);
  };

  const validateAmount = () => {
    if (amount <= 0) {
      Swal.fire("Error", "El monto debe ser mayor que 0.", "error");
      return false;
    }
    if (amount > (selectedExpense?.amountOwed || 0)) {
      Swal.fire(
        "Error",
        "El monto no puede exceder el monto adeudado.",
        "error"
      );
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!selectedExpense || !validateAmount()) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/payments/create`,
        {
          expenseUserId: selectedExpense._id,
          payer: userId,
          amount,
        }
      );

      Swal.fire({
        title: "Pago Enviado",
        text: "El pago se ha enviado para confirmación.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setShowModal(false);
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "No se pudo enviar el pago.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  };

  if (loading) return <p>Cargando gastos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="expense-list-container">
      <h2>Mis Gastos</h2>

      <div className="expense-category">
        <h3>Pagados</h3>
        {paidExpenses.length > 0 ? (
          <ul>
            {paidExpenses.map((expense) => (
              <li key={expense._id} className="expense-item">
                <p>
                  <strong>{expense.expenseId.description}</strong>
                </p>
                <p>Monto: ${expense.initialAmount.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes gastos pagados.</p>
        )}
      </div>

      <div className="expense-category">
        <h3>Pendientes</h3>
        {pendingExpenses.length > 0 ? (
          <ul>
            {pendingExpenses.map((expense) => (
              <li
                key={expense._id}
                className="expense-item pending"
                onClick={() => handleOpenModal(expense)}
              >
                <p>
                  <strong>{expense.expenseId.description}</strong>
                </p>
                <p>Monto: ${expense.amountOwed.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes gastos pendientes.</p>
        )}
      </div>

      {/* Modal de pago */}
      {showModal && selectedExpense && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Realizar Pago</h3>
            <p>
              <strong>Descripción:</strong>{" "}
              {selectedExpense.expenseId.description}
            </p>
            <p>
              <strong>Monto adeudado:</strong> $
              {selectedExpense.amountOwed.toFixed(2)}
            </p>
            <label>
              Monto a pagar:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                min="1"
                max={selectedExpense.amountOwed}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handlePayment} disabled={loading}>
                Enviar Pago
              </button>
              <button onClick={handleCloseModal} className="cancel-button">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
