import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gorilla GYM",
    short_name: "GorilaGYM",
    description:
      "Sistema de gestión para Gorilla GYM - Control de alumnos, cuotas y rutinas",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#1a1a1a",
    orientation: "portrait",
    icons: [
      {
        src: "/android/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/android/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/android/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable", // ← Cambiar aquí (quitar "any")
      },
      {
        src: "/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable", // ← Cambiar aquí (quitar "any")
      },
    ],
  };
}
