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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-2xl shadow-md p-3"
    >
      <div className="overflow-hidden rounded-xl h-40">
        <embed
          src={`${previewUrl}#page=1`}
          type="application/pdf"
          className="w-full h-full pointer-events-none"
        />
      </div>
      <p className="text-sm mt-2 break-words text-center">{file.name}</p>
    </div>
  );
}

export default function UnirPDF() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map((file) => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);
      setFiles((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleEnviar = async () => {
    const formData = new FormData();
    files.forEach((f) => formData.append("archivos", f.file)); // <-- importante: "archivos" según backend

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
      <h1 className="text-2xl font-bold mb-4 text-center text-white">Unir PDFs</h1>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-6 block mx-auto text-white"
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {files.map((f) => (
              <SortableItem key={f.id} id={f.id} file={f.file} previewUrl={f.previewUrl} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {files.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={handleEnviar}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition-all"
          >
            Unir PDFs
          </button>
        </div>
      )}
    </div>
  );
}
