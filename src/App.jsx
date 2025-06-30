import { useState } from 'react';

function App() {
  const [archivos, setArchivos] = useState([]);
  const [urlPdfUnido, setUrlPdfUnido] = useState(null);

  const manejarSeleccion = (e) => {
    setArchivos(e.target.files);
  };

  const enviarArchivos = async () => {
    const formData = new FormData();
    for (let archivo of archivos) {
      formData.append("files", archivo);
    }

    try {
      const respuesta = await fetch("https://pidief-ab93.onrender.com/", {
        method: "POST",
        body: formData,
      });

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      setUrlPdfUnido(url);
    } catch (error) {
      alert("Error al unir PDFs: " + error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Pidief 🧩</h1>
      <p>Selecciona varios archivos PDF para unirlos:</p>

      <input type="file" accept="application/pdf" multiple onChange={manejarSeleccion} />
      <button onClick={enviarArchivos} style={{ marginTop: "1rem" }}>
        Unir PDFs
      </button>

      {urlPdfUnido && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Tu PDF unido está listo:</p>
          <a href={urlPdfUnido} download="pidief-unido.pdf">📥 Descargar PDF</a>
        </div>
      )}
    </div>
  );
}

export default App;
