import React, { useState, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { useSensor, useSensors, PointerSensor, DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = workerSrc;

const PDFPreview = ({ file, index, rotation, onDelete, onRotate }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  React.useEffect(() => {
    const renderPreview = async () => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.7 }); // REDUCIR ESCALA
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
    <div className="w-full max-w-xs border rounded shadow bg-white p-2 flex flex-col items-center justify-between relative">
      {previewUrl ? (
        <div className="w-full relative">
          <img 
            src={previewUrl} 
            alt={`Vista previa ${index + 1}`} 
            className="w-full h-auto mb-2" 
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="absolute right-0 top-0 flex flex-col space-y-2">
            <button 
              onClick={onDelete} 
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow"
              title="Eliminar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button 
              onClick={onRotate} 
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow"
              title="Rotar 90°"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">Cargando...</div>
      )}
      <p className="text-sm text-gray-700 truncate max-w-full text-center">{file.name}</p>
    </div>
  );
};

const SortableItem = ({ file, id, index, rotation, onDelete, onRotate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-move">
      <PDFPreview 
        file={file} 
        index={index} 
        rotation={rotation} 
        onDelete={onDelete} 
        onRotate={onRotate} 
      />
    </div>
  );
};

export default function UnirPDF() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithId = files.map((file) => ({ id: uuidv4(), file, rotation: 0 }));
    setPdfFiles((prev) => [...prev, ...filesWithId]);
  };

  const handleDownload = async () => {
    const formData = new FormData();
    
    // For each PDF file, we need to add both the file and its rotation information
    pdfFiles.forEach(({ file, rotation }) => {
      formData.append("files", file);
      formData.append("rotations", rotation);
    });

    const response = await fetch("https://pidief-ab93.onrender.com/unir-pdf/", {
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

  const handleDeleteFile = (id) => {
    setPdfFiles(pdfFiles.filter(file => file.id !== id));
  };

  const handleRotateFile = (id) => {
    setPdfFiles(pdfFiles.map(file => {
      if (file.id === id) {
        // Rotate by 90 degrees (add 90 to the current rotation)
        return { ...file, rotation: (file.rotation + 90) % 360 };
      }
      return file;
    }));
  };

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
          onClick={() => inputRef.current.click()}
        >
          Seleccionar PDFs
        </button>
        <input
          type="file"
          accept="application/pdf"
          multiple
          ref={inputRef}
          onChange={handleFilesChange}
          className="hidden"
        />

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pdfFiles.map(({ file, id, rotation }, index) => (
                    <SortableItem 
                      key={id} 
                      id={id} 
                      file={file} 
                      index={index} 
                      rotation={rotation}
                      onDelete={() => handleDeleteFile(id)}
                      onRotate={() => handleRotateFile(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Descargar PDF unido
            </button>
          </>
        )}
      </div>
    </div>
  );
}