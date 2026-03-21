// 1. Změň import na Hash variantu
import { createHashRouter } from "react-router"; 
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Notes from "./pages/Notes";
import Materials from "./pages/Materials";
import Tests from "./pages/Tests";
import ClassDetail from "./pages/ClassDetail";

// 2. Použij createHashRouter místo createBrowserRouter
export const router = createHashRouter([
  {
    path: "/home",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "rozvrh", Component: Schedule },
      { path: "rozvrh/:classId", Component: ClassDetail },
      { path: "zapisnik", Component: Notes },
      { path: "materialy", Component: Materials },
      { path: "testy", Component: Tests },
    ],
  },
]);