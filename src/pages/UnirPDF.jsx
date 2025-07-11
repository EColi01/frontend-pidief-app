import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function SortableItem({ id, file }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [renderedCanvas, setRenderedCanvas] = useState(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  // Render PDF preview on load
  useState(() => {
    const renderPreview = async () => {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");

      await page.render({ canvasContext: context, viewport }).promise;
      setRenderedCanvas(canvas.toDataURL());
    };

    renderPreview();
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border p-2 rounded bg-white shadow"
    >
      {renderedCanvas ? (
        <img src={renderedCanvas} alt="Preview" className="w-full h-auto" />
      ) : (
        <p>Cargando vista previa...</p>
      )}
      <p className="text-sm mt-2 break-words">{file.name}</p>
    </div>
  );
}

export default function UnirPDF() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map((file) => ({
      id: uuidv4(),
      file,
    }));
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);
      setFiles((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleEnviar = async () => {
    const formData = new FormData();
    files.forEach(({ file }) => formData.append("files", file));

    const res = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unido.pdf";
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <input type="file" multiple accept="application/pdf" onChange={handleFileChange} />
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {files.map(({ id, file }) => (
              <SortableItem key={id} id={id} file={file} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {files.length > 0 && (
        <button onClick={handleEnviar} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
          Unir PDFs
        </button>
      )}
    </div>
  );
}
