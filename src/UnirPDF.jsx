import { useState } from "react";

export default function UnirPDF() {
  const [files, setFiles] = useState([]);
  const [pdfURL, setPdfURL] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setPdfURL(null);
  };

  const handleSubmit = async () => {
    if (!files.length) return alert("Selecciona al menos un archivo PDF.");

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      setLoading(true);
      const response = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al unir los PDFs");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfURL(url);
    } catch (err) {
      alert("Error al unir PDFs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Unir archivos PDF</h2>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Unir PDFs"}
        </button>
      </div>

      {pdfURL && (
        <div className="mt-6">
          <p className="mb-2 text-green-600">✅ Tu PDF unido está listo:</p>
          <a
            href={pdfURL}
            download="unido.pdf"
            className="text-blue-600 underline"
          >
            Descargar PDF
          </a>
        </div>
      )}
    </div>
  );
}
