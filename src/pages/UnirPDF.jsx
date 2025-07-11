// src/pages/UnirPDF.jsx
import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

function SortableItem({ id, file, preview }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-2 rounded shadow">
      <img src={preview} alt="Vista previa PDF" className="w-full h-40 object-contain" />
      <p className="text-sm mt-2 break-words">{file.name}</p>
    </div>
  );
}

export default function UnirPDF() {
  const [files, setFiles] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);

    const newFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const imageUrl = canvas.toDataURL();

        return {
          id: uuidv4(),
          file,
          preview: imageUrl,
        };
      })
    );

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);
      setFiles((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleEnviar = async () => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f.file));

    const res = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Error al unir los archivos PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unido.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <input type="file" multiple accept="application/pdf" onChange={handleFileChange} className="mb-4" />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((f) => (
              <SortableItem key={f.id} id={f.id} file={f.file} preview={f.preview} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {files.length > 0 && (
        <button
          onClick={handleEnviar}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Unir PDFs
        </button>
      )}
    </div>
  );
}
