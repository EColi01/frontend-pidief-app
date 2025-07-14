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

  // This effect handles the initial file loading and preview generation
  React.useEffect(() => {
    const renderPreview = async () => {
      try {
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
      } catch (error) {
        console.error("Error rendering PDF preview:", error);
      }
    };

    renderPreview();
  }, [file]); // Only re-render preview when file changes

  return (
    <div className="w-full max-w-xs border rounded shadow bg-white p-2 flex flex-col items-center justify-between relative">
      {previewUrl ? (
        <div className="w-full relative">
          {/* PDF Preview Container */}
          <div className="w-full flex justify-center items-center mb-4" style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.3s ease-in-out",
            minHeight: "200px"
          }}>
            <img 
              src={previewUrl} 
              alt={`Vista previa ${index + 1}`} 
              className="w-full h-auto object-contain"
            />
          </div>
          
          {/* Control Buttons - Separate from rotation container */}
          <div className="absolute top-0 right-0 z-10">
            <div className="flex flex-col space-y-2 p-1">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }} 
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow z-20"
                title="Eliminar"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRotate();
                }} 
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow z-20"
                title="Rotar 90°"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id,
    // Disable drag when clicking on buttons
    modifiers: [{
      name: 'preventOverlap',
      options: {
        strategy: 'always',
      },
    }]
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Apply drag handlers only to a handle area, not the entire component */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-100 opacity-30 cursor-move z-10 rounded-t" 
        {...attributes} 
        {...listeners}>
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
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
    
    // Create a rotations object to map file index to rotation angle
    const rotationsMap = {};
    
    // Add all files to formData
    pdfFiles.forEach(({ file, rotation }, index) => {
      formData.append("files", file);
      rotationsMap[index] = rotation;
    });
    
    // Add the rotations map as a JSON string
    formData.append("rotations", JSON.stringify(rotationsMap));

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