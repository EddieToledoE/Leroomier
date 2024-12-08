import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { ServerClient } from "postmark"; // Importar correctamente ServerClient
import { connectarBD } from "@/libs/mongodb";
import Usuario from "@/models/user";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

// Configuración de Postmark
const client = new ServerClient(process.env.POSTMARK_API_KEY!);

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  console.log(email);
  await connectarBD();

  try {
    const usuario = await Usuario.findOne({ email }); // Asegúrate de que `email` esté definido
    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const resetToken = uuidv4();
    usuario.resetPasswordToken = resetToken;
    usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await usuario.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await client.sendEmail({
      From: "leroomier@mirandaytoledo.com",
      To: email,
      Subject: "Recupera tu contraseña",
      TextBody: `Recibimos una solicitud para recuperar tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
      HtmlBody: `<p>Recibimos una solicitud para recuperar tu contraseña. Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetLink}">Restablecer contraseña</a></p>`,
    });

    return NextResponse.json(
      { message: "Correo de recuperación enviado" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Hubo un error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
