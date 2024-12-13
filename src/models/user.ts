const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: { type: String, required: true, unique: true }, // Nuevo campo único
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  resetPasswordToken: {
    type: String, // El token para la recuperación de la contraseña
    default: null,
  },
  resetPasswordExpires: {
    type: Date, // La fecha de expiración del token
    default: null,
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  incomingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Solicitudes recibidas
  outgoingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Solicitudes enviadas
  notificationPreferences: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Usuario = mongoose.models.User || mongoose.model("User", UserSchema);

export default Usuario;
