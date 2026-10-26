import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/sora";
import "./globals.css";
import "./reference-theme.css";
export const metadata: Metadata = {
  title: "EduControl 360 · Portal estudiante",
  description: "Tu vida académica, conectada.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
