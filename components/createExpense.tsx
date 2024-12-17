"use client";

import { useState } from "react";
import axios from "axios";
import "./styles/createExpense.css";

type User = {
  _id: string;
  username: string;
};

type CreateExpenseProps = {
  groupId: string;
  members: User[];
  paidBy: string; // ID del usuario autenticado
};

const CreateExpense = ({ groupId, members, paidBy }: CreateExpenseProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [splitDetails, setSplitDetails] = useState(
    members.map((member) => ({
      userId: member._id,
      username: member.username,
      customAmountOwed: 0,
      selected: false,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCustomAmountChange = (index: number, value: string) => {
    const updatedSplitDetails = [...splitDetails];
    updatedSplitDetails[index].customAmountOwed = parseFloat(value) || 0;
    setSplitDetails(updatedSplitDetails);
  };

  const handleMemberSelection = (index: number) => {
    const updatedSplitDetails = [...splitDetails];
    updatedSplitDetails[index].selected = !updatedSplitDetails[index].selected;
    setSplitDetails(updatedSplitDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!description.trim() || amount <= 0) {
      setError("La descripción y el monto deben ser válidos.");
      setLoading(false);
      return;
    }

    // Filtrar solo los miembros seleccionados
    const selectedMembers = splitDetails.filter((member) => member.selected);

    if (selectedMembers.length === 0) {
      setError("Debe seleccionar al menos un miembro para dividir el gasto.");
      setLoading(false);
      return;
    }

    const totalSplit = selectedMembers.reduce(
      (total, detail) => total + detail.customAmountOwed,
      0
    );

    if (totalSplit !== amount) {
      setError(
        "El monto total no coincide con la suma de los montos divididos."
      );
      setLoading(false);
      return;
    }

    try {
      console.log({
        groupId,
        description,
        amount,
        paidBy,
        splitBetween: selectedMembers.map(({ userId, customAmountOwed }) => ({
          userId,
          customAmountOwed,
        })),
      });
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/expenses/create`,
        {
          groupId,
          description,
          amount,
          paidBy,
          splitBetween: selectedMembers.map(({ userId, customAmountOwed }) => ({
            userId,
            customAmountOwed,
          })),
        }
      );

      setSuccess(`Gasto "${response.data.description}" creado con éxito.`);
      setDescription("");
      setAmount(0);
      setSplitDetails(
        members.map((member) => ({
          userId: member._id,
          username: member.username,
          customAmountOwed: 0,
          selected: false,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear el gasto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-expense-container">
      <h2>Crear Gasto</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="description">Descripción</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="amount">Monto Total</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <h3>División del Gasto</h3>
        {splitDetails.map((detail, index) => (
          <div key={detail.userId} className="split-row">
            <label>
              <input
                type="checkbox"
                checked={detail.selected}
                onChange={() => handleMemberSelection(index)}
              />
              {detail.username}
            </label>
            {detail.selected && (
              <input
                type="number"
                value={detail.customAmountOwed}
                onChange={(e) =>
                  handleCustomAmountChange(index, e.target.value)
                }
                className="split-input"
                placeholder="Monto"
              />
            )}
          </div>
        ))}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Creando..." : "Crear Gasto"}
        </button>
      </form>
    </div>
  );
};

export default CreateExpense;
