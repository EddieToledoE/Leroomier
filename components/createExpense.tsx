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
  const [splitMode, setSplitMode] = useState<"manual" | "equal" | "percentage">(
    "manual"
  );
  const [splitDetails, setSplitDetails] = useState(
    members.map((member) => ({
      userId: member._id,
      username: member.username,
      customAmountOwed: 0,
      customPercentage: 0,
      selected: false,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Actualizar monto total
  const handleAmountChange = (value: string) => {
    const newAmount = parseFloat(value) || 0;
    setAmount(newAmount);
    if (splitMode === "equal") updateEqualSplit(newAmount);
    if (splitMode === "percentage") updatePercentageSplit(newAmount);
  };

  // Cambiar modo de división
  const handleSplitModeChange = (mode: "manual" | "equal" | "percentage") => {
    setSplitMode(mode);
    if (mode === "equal") updateEqualSplit(amount);
    if (mode === "percentage") updatePercentageSplit(amount);
  };

  // División igualitaria
  const updateEqualSplit = (totalAmount: number) => {
    const selectedMembers = splitDetails.filter((member) => member.selected);
    const equalAmount = selectedMembers.length
      ? totalAmount / selectedMembers.length
      : 0;

    const updatedDetails = splitDetails.map((member) =>
      member.selected
        ? { ...member, customAmountOwed: parseFloat(equalAmount.toFixed(2)) }
        : { ...member, customAmountOwed: 0 }
    );
    setSplitDetails(updatedDetails);
  };

  // División por porcentajes
  const updatePercentageSplit = (totalAmount: number) => {
    const updatedDetails = splitDetails.map((member) => ({
      ...member,
      customAmountOwed: member.selected
        ? parseFloat(((member.customPercentage / 100) * totalAmount).toFixed(2))
        : 0,
    }));
    setSplitDetails(updatedDetails);
  };

  const handleMemberSelection = (index: number) => {
    const updatedDetails = [...splitDetails];
    updatedDetails[index].selected = !updatedDetails[index].selected;
    setSplitDetails(updatedDetails);
    if (splitMode === "equal") updateEqualSplit(amount);
    if (splitMode === "percentage") updatePercentageSplit(amount);
  };

  const handlePercentageChange = (index: number, value: string) => {
    const newPercentage = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
    const updatedDetails = [...splitDetails];
    updatedDetails[index].customPercentage = newPercentage;

    const totalPercentage = updatedDetails.reduce(
      (sum, member) => (member.selected ? sum + member.customPercentage : sum),
      0
    );

    if (totalPercentage > 100) {
      setError("La suma de los porcentajes no puede superar el 100%.");
      return;
    } else {
      setError(null);
    }

    setSplitDetails(updatedDetails);
    updatePercentageSplit(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMembers = splitDetails.filter((member) => member.selected);
    const totalSplit = selectedMembers.reduce(
      (sum, member) => sum + member.customAmountOwed,
      0
    );

    if (totalSplit !== amount) {
      setError("La suma de los montos no coincide con el monto total.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
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
      setSuccess("Gasto creado exitosamente.");
    } catch {
      setError("Hubo un error al crear el gasto.");
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
          <label>Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Monto Total</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
          />
        </div>

        <div className="split-options">
          <label>
            <input
              type="radio"
              checked={splitMode === "manual"}
              onChange={() => handleSplitModeChange("manual")}
            />
            División Manual
          </label>
          <label>
            <input
              type="radio"
              checked={splitMode === "equal"}
              onChange={() => handleSplitModeChange("equal")}
            />
            Dividir Igualitariamente
          </label>
          <label>
            <input
              type="radio"
              checked={splitMode === "percentage"}
              onChange={() => handleSplitModeChange("percentage")}
            />
            Dividir por Porcentajes
          </label>
        </div>

        {splitDetails.map((member, index) => (
          <div key={member.userId} className="split-row">
            <label>
              <input
                type="checkbox"
                checked={member.selected}
                onChange={() => handleMemberSelection(index)}
              />
              {member.username}
            </label>
            {member.selected && splitMode === "manual" && (
              <input
                type="number"
                placeholder="Monto"
                value={member.customAmountOwed}
                onChange={(e) => {
                  const newDetails = [...splitDetails];
                  newDetails[index].customAmountOwed =
                    parseFloat(e.target.value) || 0;
                  setSplitDetails(newDetails);
                }}
              />
            )}
            {member.selected && splitMode === "percentage" && (
              <>
                <input
                  type="number"
                  placeholder="Porcentaje"
                  value={member.customPercentage}
                  onChange={(e) =>
                    handlePercentageChange(index, e.target.value)
                  }
                />
                <span>${member.customAmountOwed.toFixed(2)}</span>
              </>
            )}
            {member.selected && splitMode === "equal" && (
              <span>${member.customAmountOwed.toFixed(2)}</span>
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Gasto"}
        </button>
      </form>
    </div>
  );
};

export default CreateExpense;
