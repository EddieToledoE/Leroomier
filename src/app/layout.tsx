"use client";

import { ThemeProvider } from "../../components/themeContext";
import "./globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import Navbar from "../../components/navBar"; // Importar la Navbar

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <ThemeProvider>
        <SessionProvider>
          <body>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          </body>
        </SessionProvider>
      </ThemeProvider>
    </html>
  );
}

// Layout dinámico para mostrar la Navbar solo si el usuario está autenticado
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "authenticated") {
    // Si el usuario está logeado, mostramos la Navbar junto con los hijos
    return (
      <>
        <Navbar />
        <main>{children}</main>
      </>
    );
  }

  // Si el usuario no está logeado, renderizamos solo los hijos (sin Navbar)
  return <main>{children}</main>;
}
