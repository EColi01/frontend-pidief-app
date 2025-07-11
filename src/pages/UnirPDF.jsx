import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

// Configurar pdfjs-dist correctamente
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker?worker";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function SortableItem({ id, file, preview }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded shadow p-2 flex flex-col items-center"
    >
      <canvas
        ref={(canvas) => {
          if (canvas && preview) {
            const ctx = canvas.getContext("2d");
            const { width, height, data } = preview;
            canvas.width = width;
            canvas.height = height;
            const imgData = ctx.createImageData(width, height);
            imgData.data.set(data);
            ctx.putImageData(imgData, 0, 0);
          }
        }}
        className="w-full h-40 object-contain"
      />
      <p className="text-sm mt-2 text-center break-words">{file.name}</p>
    </div>
  );
}

export default function UnirPDF() {
  const [files, setFiles] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);

    const filePreviews = await Promise.all(
      selectedFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        return {
          id: uuidv4(),
          file,
          preview: {
            width: canvas.width,
            height: canvas.height,
            data: imageData.data,
          },
        };
      })
    );

    setFiles((prev) => [...prev, ...filePreviews]);
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
    files.forEach((f) => formData.append("files", f.file)); // 👈 asegúrate que sea "files"

    const res = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Error al unir los archivos");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unido.pdf";
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
        Unir Archivos PDF
      </h2>

      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="mb-6 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
        <div className="text-center mt-6">
          <button
            onClick={handleEnviar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition"
          >
            Unir PDFs
          </button>
        </div>
      )}
    </div>
  );
}
