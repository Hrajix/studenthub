import { StrictMode } from 'react';
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router"; 
import { router } from "./app/routes"; 
import "./styles/index.css";
import { ClerkProvider } from '@clerk/clerk-react'; // Správný import

// 1. Načtení klíče
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Chybí klíč v .env! Zkontroluj soubor .env v kořenu projektu.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 2. Clerk musí být NAD routerem, aby byl dostupný v celé aplikaci */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);