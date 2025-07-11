import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UnirPDF from './pages/UnirPDF';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/unir-pdf" element={<UnirPDF />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
