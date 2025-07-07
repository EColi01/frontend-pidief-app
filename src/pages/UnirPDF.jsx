// src/components/UnirPDF.jsx
import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

function SortableItem({ id, file, previewUrl }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="border p-2 rounded bg-white shadow">
      <embed src={previewUrl} type="application/pdf" className="w-full h-40" />
      <p className="text-sm mt-2 break-words">{file.name}</p>
    </div>
  );
}

export default function UnirPDF() {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map((file) => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newFiles.map((f) => f.previewUrl)]);
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
    <div className="max-w-3xl mx-auto p-4">
      <input type="file" multiple accept="application/pdf" onChange={handleFileChange} className="mb-4" />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 gap-4">
            {files.map((f) => (
              <SortableItem key={f.id} id={f.id} file={f.file} previewUrl={f.previewUrl} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {files.length > 0 && (
        <button onClick={handleEnviar} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Unir PDFs
        </button>
      )}
    </div>
  );
}
