import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router"
import { router } from "./app/routes"
import './styles/index.css'

// --- FIX PRO SUPABASE AUTH + HASHROUTER ---
// Tento kód musí běžet hned při načtení souboru, před vykreslením Reactu
(function handleAuthRedirects() {
  const hash = window.location.hash;
  const search = window.location.search;

  // 1. Ošetření chyby (Uživatel klikl na "Zrušit" v Google okně)
  if (search.includes('error=access_denied')) {
    window.location.href = window.location.origin + '/#/';
    return;
  }

  // 2. Ošetření úspěšného přihlášení (Přesměrování tokenu do /panel)
  if (hash && (hash.includes('access_token=') || hash.includes('error='))) {
    // Pokud URL vypadá jako /#/#access_token... (zdvojená mřížka)
    if (hash.startsWith('#/#')) {
      const newHash = hash.replace('#/#', '#/panel#');
      window.location.hash = newHash;
      window.location.reload();
    } 
    // Pokud URL vypadá jako /#access_token... (chybí cesta k panelu)
    else if (hash.startsWith('#access_token=')) {
      window.location.hash = '#/panel' + hash;
      window.location.reload();
    }
  }
})();
// ------------------------------------------

// Vykreslení aplikace
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)