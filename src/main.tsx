
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Import des utilitaires de test backend (disponibles dans la console)
  import './services/backendTestUtils';
  import './services/backendInitUtils';

  createRoot(document.getElementById("root")!).render(<App />);
  