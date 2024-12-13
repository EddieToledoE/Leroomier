import NextAuth, { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dotenv from "dotenv";

dotenv.config();

declare module "next-auth" {
  interface Session {
    token?: string;
    user: {
      id: string;
      name: string;
      email: string;
      token?: string;
    };
  }
}

declare module "next-auth" {
  interface User {
    token?: string;
    id: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Correo",
          type: "email",
          placeholder: "Correo@gmail.com",
        },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        // Llamada a tu backend para autenticar
        const res = await fetch(
          `${process.env.BACKEND_URL}/api/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Credenciales inválidas");
        }

        // Aquí asumimos que el backend retorna un usuario con el campo 'id'
        const user = {
          id: data.user._id, // Asegúrate de que 'id' esté presente
          name: data.user.name,
          email: data.user.email,
        };
        const token = data.token; // Guardamos el token en el JWT
        console.log(token);
        return { ...user, token };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user; // Incluye el objeto `user` en el token
        (token.user as User).id = user.id; // Asegura que el `id` esté presente
      }
      return token;
    },
    session({ session, token }) {
      session.user = token.user as any; // Incluye el objeto `user` completo del token
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
});

export { handler as GET, handler as POST };
