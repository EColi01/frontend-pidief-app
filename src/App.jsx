import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Encabezado */}
      <header className="bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pidief</h1>
        <span className="text-gray-400 text-sm">Herramientas PDF</span>
      </header>

      {/* Hero */}
      <section className="text-center py-10 px-4">
        <h2 className="text-3xl font-bold mb-2">Herramientas para amantes de los PDF</h2>
        <p className="text-gray-300 max-w-xl mx-auto">
          Une, divide, convierte y edita tus PDFs en línea sin instalar nada.
        </p>
      </section>

      {/* Rejilla de herramientas */}
      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
        {/* Unir PDF */}
        <div
          onClick={() => navigate("/unir")}
          className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
        >
          <div className="text-4xl mb-2">📎</div>
          <h3 className="text-lg font-semibold">Unir PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Combina varios archivos PDF en uno solo.</p>
        </div>

        {/* Dividir PDF */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">✂️</div>
          <h3 className="text-lg font-semibold">Dividir PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Separa páginas específicas de un PDF en uno nuevo.</p>
        </div>

        {/* Comprimir PDF */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">📉</div>
          <h3 className="text-lg font-semibold">Comprimir PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Reduce el tamaño del archivo PDF sin perder calidad.</p>
        </div>

        {/* PDF a Word */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">📝</div>
          <h3 className="text-lg font-semibold">PDF a Word</h3>
          <p className="text-sm text-gray-600 mt-1">Convierte tu archivo PDF en un documento Word editable.</p>
        </div>

        {/* PDF a JPG */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">🖼️</div>
          <h3 className="text-lg font-semibold">PDF a JPG</h3>
          <p className="text-sm text-gray-600 mt-1">Convierte las páginas de un PDF a imágenes JPG.</p>
        </div>

        {/* Firmar PDF */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">✍️</div>
          <h3 className="text-lg font-semibold">Firmar PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Agrega una firma electrónica a tu archivo PDF.</p>
        </div>

        {/* Proteger PDF */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold">Proteger PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Añade contraseña a tus archivos PDF para protegerlos.</p>
        </div>

        {/* Rotar PDF */}
        <div className="bg-white text-gray-900 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="text-4xl mb-2">🔄</div>
          <h3 className="text-lg font-semibold">Rotar PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Gira una o varias páginas de un archivo PDF!</p>
        </div>
      </main>
    </div>
  );
}
