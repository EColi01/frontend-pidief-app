import React, { useState, useRef, useEffect } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { useSensor, useSensors, PointerSensor, DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = workerSrc;

// Componente para la vista previa de una página del PDF
const PDFPagePreview = ({ pageData, rotation, isSelected, onToggleSelect, onDelete, onRotate }) => {
  return (
    <div className="w-full max-w-xs border rounded shadow bg-white p-2 flex flex-col items-center justify-between relative">
      <div className="w-full relative">
        {/* PDF Preview Container */}
        <div className="w-full flex justify-center items-center mb-4" style={{ 
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s ease-in-out",
          minHeight: "200px"
        }}>
          <img 
            src={pageData.previewUrl} 
            alt={`Página ${pageData.pageNumber}`} 
            className="w-full h-auto object-contain"
          />
        </div>
        
        {/* Control Buttons - Top right */}
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

        {/* Selection Checkbox - Top left */}
        <div className="absolute top-2 left-2 z-20">
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`w-6 h-6 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
              isSelected ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-300 hover:border-blue-400'
            }`}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-700 truncate max-w-full text-center">Página {pageData.pageNumber}</p>
    </div>
  );
};

// Componente para permitir arrastrar y soltar
const SortableItem = ({ pageData, id, rotation, isSelected, onToggleSelect, onDelete, onRotate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id,
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
      {/* Drag handle */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-100 opacity-30 cursor-move z-10 rounded-t" 
        {...attributes} 
        {...listeners}
      >
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
      <PDFPagePreview 
        pageData={pageData}
        rotation={rotation}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onDelete={onDelete} 
        onRotate={onRotate} 
      />
    </div>
  );
};

// Opciones del menú lateral
const MenuOption = ({ id, title, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full text-left px-4 py-2 rounded transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800'
    }`}
  >
    {title}
  </button>
);

export default function DividirPDF() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeOption, setActiveOption] = useState('pages');
  const inputRef = useRef(null);

  // Cargar el PDF cuando se selecciona un archivo
  useEffect(() => {
    if (!pdfFile) return;

    const loadPdf = async () => {
      try {
        setIsProcessing(true);
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const newPages = [];

        for (let i = 1; i <= numPages; i++) {
          // Actualizar progreso
          setUploadProgress(Math.floor((i / numPages) * 100));
          
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.7 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          
          newPages.push({
            id: uuidv4(),
            pageNumber: i,
            previewUrl: canvas.toDataURL(),
            rotation: 0,
            selected: true  // Por defecto, todas las páginas están seleccionadas
          });
        }

        setPdfPages(newPages);
      } catch (error) {
        console.error("Error al cargar el PDF:", error);
        alert("Error al cargar el PDF. Por favor, intente con otro archivo.");
      } finally {
        setIsProcessing(false);
        setUploadProgress(0);
      }
    };

    loadPdf();
  }, [pdfFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const handleDeletePage = (id) => {
    setPdfPages(pdfPages.filter(page => page.id !== id));
  };

  const handleRotatePage = (id) => {
    setPdfPages(pdfPages.map(page => {
      if (page.id === id) {
        return { ...page, rotation: (page.rotation + 90) % 360 };
      }
      return page;
    }));
  };

  const handleToggleSelect = (id) => {
    setPdfPages(pdfPages.map(page => {
      if (page.id === id) {
        return { ...page, selected: !page.selected };
      }
      return page;
    }));
  };

  const handleSelectAll = () => {
    setPdfPages(pdfPages.map(page => ({ ...page, selected: true })));
  };

  const handleDeselectAll = () => {
    setPdfPages(pdfPages.map(page => ({ ...page, selected: false })));
  };

  const handleDownload = async () => {
    try {
      setIsProcessing(true);
      setUploadProgress(0);

      // Solo enviar las páginas seleccionadas
      const selectedPages = pdfPages.filter(page => page.selected)
        .map(page => page.pageNumber);
      
      if (selectedPages.length === 0) {
        alert("Por favor, seleccione al menos una página para extraer.");
        setIsProcessing(false);
        return;
      }

      // Crear un objeto con las rotaciones de cada página
      const rotations = {};
      pdfPages.filter(page => page.selected).forEach(page => {
        // Solo incluir páginas con rotación
        if (page.rotation !== 0) {
          rotations[page.pageNumber] = page.rotation;
        }
      });

      // Crear formData para el envío
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("selected_pages", JSON.stringify(selectedPages));
      formData.append("rotations", JSON.stringify(rotations));

      // Crear un XHR para monitorear el progreso
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://pidief-ab93.onrender.com/dividir-pdf/", true);
      
      // Configurar seguimiento del progreso
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      // Manejar la respuesta
      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response, { 
              status: xhr.status,
              statusText: xhr.statusText
            }));
          } else {
            reject(new Error('Error en la extracción de páginas'));
          }
        };
        xhr.onerror = () => reject(new Error('Error de red'));
        xhr.onabort = () => reject(new Error('Operación cancelada'));
        xhr.responseType = 'blob';
        xhr.send(formData);
      });

      // Completar la barra de progreso
      setUploadProgress(100);
      
      // Descargar el archivo resultante
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paginas_divididas.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al dividir el PDF:", error);
      alert("Error al dividir el PDF: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Panel izquierdo: carga de PDF y vista previa */}
          <div className="w-full md:w-3/4">
            {!pdfFile ? (
              <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-10 border-2 border-dashed border-gray-600 h-64">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow mb-4"
                  onClick={() => inputRef.current.click()}
                >
                  Seleccionar PDF
                </button>
                <input
                  type="file"
                  accept="application/pdf"
                  ref={inputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-gray-400">Selecciona un archivo PDF para dividirlo</p>
              </div>
            ) : (
              <>
                {/* Opciones para seleccionar todas/ninguna */}
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {pdfFile.name}
                    </h2>
                    <div className="text-sm text-gray-400">
                      {pdfPages.length} páginas • {pdfPages.filter(p => p.selected).length} seleccionadas
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded shadow text-sm"
                    >
                      Seleccionar todas
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-1 px-3 rounded shadow text-sm"
                    >
                      Deseleccionar todas
                    </button>
                  </div>
                </div>

                {/* Vista previa de páginas con arrastra y suelta */}
                {isProcessing ? (
                  <div className="bg-gray-800 rounded-lg p-10 flex flex-col items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{uploadProgress < 100 ? `Procesando: ${uploadProgress}%` : "Finalizando..."}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => {
                        const { active, over } = event;
                        if (active.id !== over.id) {
                          const oldIndex = pdfPages.findIndex((p) => p.id === active.id);
                          const newIndex = pdfPages.findIndex((p) => p.id === over.id);
                          setPdfPages(arrayMove(pdfPages, oldIndex, newIndex));
                        }
                      }}
                    >
                      <SortableContext items={pdfPages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {pdfPages.map((page) => (
                            <SortableItem 
                              key={page.id} 
                              id={page.id} 
                              pageData={page} 
                              rotation={page.rotation}
                              isSelected={page.selected}
                              onToggleSelect={() => handleToggleSelect(page.id)}
                              onDelete={() => handleDeletePage(page.id)}
                              onRotate={() => handleRotatePage(page.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <div className="mt-6">
                      <button
                        onClick={handleDownload}
                        disabled={isProcessing || pdfPages.filter(p => p.selected).length === 0}
                        className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow ${
                          isProcessing || pdfPages.filter(p => p.selected).length === 0 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        Extraer páginas seleccionadas
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Panel derecho: opciones */}
          <div className="w-full md:w-1/4 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Opciones</h3>
            <div className="space-y-2">
              <MenuOption 
                id="pages" 
                title="Páginas" 
                isActive={activeOption === 'pages'} 
                onClick={setActiveOption} 
              />
              {/* Otras opciones para futuras implementaciones */}
              <MenuOption 
                id="range" 
                title="Rango de páginas" 
                isActive={activeOption === 'range'} 
                onClick={setActiveOption} 
              />
              <MenuOption 
                id="bookmarks" 
                title="Marcadores" 
                isActive={activeOption === 'bookmarks'} 
                onClick={setActiveOption} 
              />
            </div>

            {/* Descripción de la opción activa */}
            <div className="mt-6 p-3 bg-gray-700 rounded-lg text-sm">
              {activeOption === 'pages' && (
                <p>Seleccione las páginas que desea extraer. Puede arrastrar para reordenarlas.</p>
              )}
              {activeOption === 'range' && (
                <p>Especifique un rango de páginas para extraer (próximamente).</p>
              )}
              {activeOption === 'bookmarks' && (
                <p>Divida el PDF basándose en los marcadores (próximamente).</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}