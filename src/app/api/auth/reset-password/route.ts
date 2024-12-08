import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectarBD } from "@/libs/mongodb";
import Usuario from "@/models/user";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token y nueva contraseña son requeridos" },
      { status: 400 }
    );
  }

  try {
    await connectarBD();

    // Buscar usuario por el token de restablecimiento y verificar que no esté expirado
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    // Generar nueva contraseña hasheada
    const hashedPassword = await bcrypt.hash(password, 10);

    usuario.password = hashedPassword;
    usuario.resetPasswordToken = undefined; // Eliminar token usado
    usuario.resetPasswordExpires = undefined; // Eliminar expiración
    await usuario.save();

    return NextResponse.json(
      { message: "Contraseña actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Hubo un error al restablecer la contraseña" },
      { status: 500 }
    );
  }
}
