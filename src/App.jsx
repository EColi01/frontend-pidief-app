import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UnirPDF from './pages/UnirPDF';
import DividirPDF from './pages/DividirPDF';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unir-pdf" element={<UnirPDF />} />
          <Route path="/dividir-pdf" element={<DividirPDF />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
