import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/legacy/build/pdf.worker.min.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

function SortableItem({ id, file, preview }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="border p-2 rounded bg-white shadow"
    >
      <canvas
        ref={(canvas) => {
          if (canvas && preview) {
            const context = canvas.getContext('2d');
            const viewport = preview.getViewport({ scale: 1 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            preview.render({ canvasContext: context, viewport });
          }
        }}
        className="w-full h-auto"
      />
      <p className="text-sm mt-2 break-words">{file.name}</p>
    </div>
  );
}

export default function UnirPDF() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState({});

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const updatedFiles = [];

    for (const file of selectedFiles) {
      const id = uuidv4();
      const reader = new FileReader();

      const preview = await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            const page = await pdf.getPage(1);
            resolve(page);
          } catch (err) {
            console.error('Error al cargar PDF:', err);
            resolve(null);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      updatedFiles.push({ id, file, preview });
    }

    setFiles((prev) => [...prev, ...updatedFiles]);
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

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unido.pdf";
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Unir PDFs</h1>
      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((f) => (
              <SortableItem key={f.id} id={f.id} file={f.file} preview={f.preview} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {files.length > 0 && (
        <button
          onClick={handleEnviar}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Unir PDFs
        </button>
      )}
    </div>
  );
}
