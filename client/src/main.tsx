import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import setupMockApi from "./lib/mockApi";

// Initialize mock API for development
if (import.meta.env.DEV) {
  setupMockApi();
}

createRoot(document.getElementById("root")!).render(<App />);
