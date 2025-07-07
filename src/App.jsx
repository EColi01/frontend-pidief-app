import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import UnirPDF from "./pages/UnirPDF"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unir" element={<UnirPDF />} />
      </Routes>
    </Router>
  )
}
