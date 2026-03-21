import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router"; // TADY nesmí být "-dom"
import { router } from "./app/routes"; // nebo cesta k tvému routes.tsx
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);