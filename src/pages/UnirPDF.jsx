import { useState } from "react"
import { Link } from "react-router-dom"

export default function UnirPDF() {
  const [archivos, setArchivos] = useState([])
  const [pdfFinal, setPdfFinal] = useState(null)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (archivos.length === 0) return

    const formData = new FormData()
    archivos.forEach((archivo) => formData.append("archivos", archivo))

    setCargando(true)
    try {
      const res = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Error al unir los PDFs")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfFinal(url)
    } catch (err) {
      alert("Error al unir PDFs")
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Unir Archivos PDF</h1>
      <p className="mb-6 text-gray-400">Selecciona tus archivos PDF y súbelos para combinarlos.</p>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => setArchivos(Array.from(e.target.files))}
          className="mb-4 w-full text-sm text-white file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-0 file:cursor-pointer"
        />

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 px-4 py-2 rounded-lg font-medium"
        >
          {cargando ? "Procesando..." : "Unir PDFs"}
        </button>
      </form>

      {pdfFinal && (
        <a
          href={pdfFinal}
          download="pdf-unido.pdf"
          className="mt-6 inline-block bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
        >
          Descargar PDF unido
        </a>
      )}

      <Link to="/" className="mt-6 text-blue-400 underline text-sm">
        ← Volver a inicio
      </Link>
    </div>
  )
}
