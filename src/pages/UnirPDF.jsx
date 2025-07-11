// src/pages/UnirPDF.jsx

import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { useDroppable, useDraggable, DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";

//import "../styles/UnirPDF.css";
// Configurar el worker localmente
GlobalWorkerOptions.workerSrc = workerSrc;

const PDFPreview = ({ file, index }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  React.useEffect(() => {
    const renderPreview = async () => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      setPreviewUrl(canvas.toDataURL());
    };

    renderPreview();
  }, [file]);

  return (
    <div className="preview">
      {previewUrl ? (
        <img src={previewUrl} alt={`Vista previa ${index + 1}`} />
      ) : (
        <div className="loading">Cargando...</div>
      )}
    </div>
  );
};

const SortableItem = ({ file, id, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PDFPreview file={file} index={index} />
    </div>
  );
};

export default function UnirPDF() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithId = files.map((file) => ({ id: uuidv4(), file }));
    setPdfFiles((prev) => [...prev, ...filesWithId]);
  };

  const handleDownload = async () => {
    const formData = new FormData();
    pdfFiles.forEach(({ file }) => formData.append("files", file));

    const response = await fetch("https://backend-pidief-app.onrender.com/unir-pdf/", {
      method: "POST",
      body: formData,
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unido.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className="unir-pdf-container">
      <input
        type="file"
        accept="application/pdf"
        multiple
        ref={inputRef}
        onChange={handleFilesChange}
        style={{ display: "none" }}
      />
      <button className="upload-button" onClick={() => inputRef.current.click()}>
        Seleccionar PDFs
      </button>

      {pdfFiles.length > 0 && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (active.id !== over.id) {
                const oldIndex = pdfFiles.findIndex((f) => f.id === active.id);
                const newIndex = pdfFiles.findIndex((f) => f.id === over.id);
                setPdfFiles(arrayMove(pdfFiles, oldIndex, newIndex));
              }
            }}
          >
            <SortableContext items={pdfFiles.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="previews-container">
                {pdfFiles.map(({ file, id }, index) => (
                  <SortableItem key={id} id={id} file={file} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button className="download-button" onClick={handleDownload}>
            Descargar PDF unido
          </button>
        </>
      )}
    </div>
  );
}
