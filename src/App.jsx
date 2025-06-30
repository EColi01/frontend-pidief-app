import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Encabezado */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-600">Pidief</h1>
        <nav>
          <span className="text-sm text-gray-600">Herramientas PDF</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center py-10">
        <h2 className="text-3xl font-semibold mb-2">Herramientas para amantes de los PDF</h2>
        <p className="text-gray-600">Une, divide, convierte y edita tus PDFs en línea sin instalar nada.</p>
      </section>

      {/* Rejilla de herramientas */}
      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
        {/* Tarjeta de unir PDF */}
        <div
          onClick={() => navigate("/unir")}
          className="bg-white border rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
        >
          <div className="text-red-600 text-3xl mb-2">📎</div>
          <h3 className="text-lg font-semibold">Unir PDF</h3>
          <p className="text-sm text-gray-500 mt-1">Combina varios archivos PDF en uno solo.</p>
        </div>
      </main>
    </div>
  );
}
