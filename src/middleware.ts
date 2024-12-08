import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // Página a la que redirige si no estás autenticado
  },
});

export const config = {
  matcher: ["/menu/:path*", "/dashboard/:path*", "/menu", "/xd"], // Rutas protegidas
};

console.log("Middleware cargado");
