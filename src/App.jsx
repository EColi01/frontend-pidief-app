import { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [pdfURL, setPdfURL] = useState(null);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al unir los PDFs");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfURL(url);
    } catch (err) {
      alert("Error al unir PDFs: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Pidief 🧩</h1>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
      />

      <button onClick={handleSubmit} style={{ marginTop: "1rem" }}>
        Unir PDFs
      </button>

      {pdfURL && (
        <div style={{ marginTop: "2rem" }}>
          <p>✅ Tu PDF unido está listo:</p>
          <a href={pdfURL} download="pidief-unido.pdf">📥 Descargar PDF</a>
        </div>
      )}
    </div>
  );
}

export default App;

