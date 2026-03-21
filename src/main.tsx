import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // <-- 1. Přidej import
import App from "./app/App.tsx";
import "./styles/index.css";

// 2. Obal App komponentu do HashRouteru
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);