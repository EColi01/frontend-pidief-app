import { Link } from "react-router-dom"

export default function UnirPDF() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">Unir Archivos PDF</h1>
      <p className="mb-8 text-gray-400">Sube tus archivos PDF para combinarlos.</p>
      {/* Aquí iría tu formulario de subida */}
      <Link to="/" className="text-blue-400 underline">← Volver a inicio</Link>
    </div>
  )
}
