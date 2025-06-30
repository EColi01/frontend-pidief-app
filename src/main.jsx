import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";           // Página principal
import UnirPDF from "./UnirPDF";   // Página para unir PDFs

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/unir" element={<UnirPDF />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
