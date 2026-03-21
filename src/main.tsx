import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router"
import { router } from "./app/routes"
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

if (window.location.search.includes('error=access_denied')) {
  // Pokud detekujeme, že uživatel klikl na "Zrušit", vyčistíme URL a hodíme ho na home
  window.location.href = window.location.origin + '/#/';
}