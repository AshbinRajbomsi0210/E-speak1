import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // ✅ render App instead of Routes
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App /> {/* AuthProvider is inside App */}
  </React.StrictMode>
);
