import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTournamentContext } from '../../context/TournamentContext';

export const DrawingUpload = () => {
  const { 
    setDrawings, 
    drawings, 
    setTournamentState, 
    TOURNAMENT_STATES 
  } = useTournamentContext();
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fullScreenDrawing, setFullScreenDrawing] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = async (files) => {
    const newDrawings = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: Date.now() + Math.random(),
              title: file.name.replace(/\.[^/.]+$/, ""),
              author: "Por asignar",
              image: reader.result,
              file: file
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setUploadedFiles(prev => [...prev, ...newDrawings]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleSaveAll = () => {
    setDrawings(uploadedFiles);
    setIsEditMode(false);
  };

  const handleStartTournament = () => {
    if (drawings.length >= 4) {
      setTournamentState(TOURNAMENT_STATES.GROUP_PHASE);
    } else {
      alert('Se necesitan al menos 4 dibujos para comenzar el torneo');
    }
  };

  return (
    <div className="space-y-8 text-gray-100 animate-fadeIn">
      {/* Header section with instructions */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-custom-highlight">Sube tus Dibujos</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Arrastra y suelta tus imágenes o selecciónalas manualmente. 
          Necesitas al menos 4 dibujos para comenzar el torneo.
        </p>
      </div>

      {!isEditMode && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center p-12
            border-2 border-dashed rounded-xl transition-all duration-300
            ${isDragging 
              ? 'border-custom-highlight bg-custom-highlight/10' 
              : 'border-custom-light bg-custom-medium hover:bg-custom-light/50'
            }
          `}
        >
          {/* Upload icon */}
          <div className="w-16 h-16 mb-4 rounded-full bg-custom-light/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-custom-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="mb-2 px-6 py-3 bg-custom-highlight text-custom-dark rounded-lg 
                     font-medium cursor-pointer hover:bg-custom-highlight/90 
                     transition-colors duration-300"
          >
            Seleccionar Archivos
          </label>
          
          <p className="text-sm text-gray-400">
            o arrastra y suelta aquí tus imágenes
          </p>
          
          {isDragging && (
            <div className="absolute inset-0 border-2 border-custom-highlight rounded-xl 
                          bg-custom-highlight/10 flex items-center justify-center">
              <p className="text-xl font-medium text-custom-highlight">
                Suelta aquí tus imágenes
              </p>
            </div>
          )}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-6 bg-custom-medium p-6 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-custom-highlight">
                Dibujos Cargados: {uploadedFiles.length}
              </h3>
              <p className="text-sm text-gray-400">
                {uploadedFiles.length >= 4 
                  ? '¡Tienes suficientes dibujos para comenzar!' 
                  : `Necesitas ${4 - uploadedFiles.length} más para comenzar`}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300
                         bg-custom-light text-gray-200 hover:bg-custom-accent
                         hover:text-custom-highlight"
              >
                {isEditMode ? "Ver Vista Previa" : "Editar Nombres"}
              </button>
              
              {!isEditMode && uploadedFiles.length >= 4 && (
                <button
                  onClick={handleStartTournament}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300
                           bg-custom-highlight text-custom-dark hover:bg-custom-highlight/90"
                >
                  Comenzar Torneo
                </button>
              )}
            </div>
          </div>

          {isEditMode ? (
            <EditDrawingsList
              drawings={uploadedFiles}
              setDrawings={setUploadedFiles}
              onSave={handleSaveAll}
            />
          ) : (
            <DrawingsPreview 
              drawings={uploadedFiles}
              onDrawingClick={setFullScreenDrawing}
            />
          )}
        </div>
      )}

      {/* Modal de Vista Completa */}
      {fullScreenDrawing && (
        <div
          className="fixed inset-0 bg-custom-dark/95 flex items-center justify-center z-50"
          onClick={() => setFullScreenDrawing(null)}
        >
          <div 
            className="max-w-7xl max-h-[90vh] p-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setFullScreenDrawing(null)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-custom-medium text-custom-highlight
                         rounded-full flex items-center justify-center hover:bg-custom-light
                         transition-colors duration-300"
            >
              ✕
            </button>
            <img
              src={fullScreenDrawing.image}
              alt={fullScreenDrawing.title}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            <div className="mt-4 bg-custom-medium p-4 rounded-lg">
              <h2 className="text-xl font-bold text-custom-highlight">
                {fullScreenDrawing.title}
              </h2>
              <p className="text-gray-300 mt-1">{fullScreenDrawing.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditDrawingsList = ({ drawings, setDrawings, onSave }) => {
  const handleAuthorChange = (id, newAuthor) => {
    setDrawings(prevDrawings =>
      prevDrawings.map(drawing =>
        drawing.id === id ? { ...drawing, author: newAuthor } : drawing
      )
    );
  };

  const handleTitleChange = (id, newTitle) => {
    setDrawings(prevDrawings =>
      prevDrawings.map(drawing =>
        drawing.id === id ? { ...drawing, title: newTitle } : drawing
      )
    );
  };

  const handleRemove = (id) => {
    setDrawings(prevDrawings => prevDrawings.filter(drawing => drawing.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {drawings.map((drawing) => (
          <div 
            key={drawing.id} 
            className="flex items-center gap-6 p-4 bg-custom-light rounded-lg
                     hover:bg-custom-accent/30 transition-colors duration-300"
          >
            <img
              src={drawing.image}
              alt={drawing.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-custom-highlight">
                  Título
                </label>
                <input
                  type="text"
                  value={drawing.title}
                  onChange={(e) => handleTitleChange(drawing.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-custom-medium border border-custom-accent
                           text-gray-100 focus:ring-2 focus:ring-custom-highlight focus:border-transparent
                           transition-all duration-300"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-custom-highlight">
                  Autor
                </label>
                <input
                  type="text"
                  value={drawing.author}
                  onChange={(e) => handleAuthorChange(drawing.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-custom-medium border border-custom-accent
                           text-gray-100 focus:ring-2 focus:ring-custom-highlight focus:border-transparent
                           transition-all duration-300"
                />
              </div>
            </div>
            <button
              onClick={() => handleRemove(drawing.id)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
              title="Eliminar dibujo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSave}
          className="px-6 py-3 bg-custom-highlight text-custom-dark rounded-lg
                   font-medium hover:bg-custom-highlight/90 transition-colors duration-300"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

const DrawingsPreview = ({ drawings, onDrawingClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {drawings.map((drawing) => (
        <div 
          key={drawing.id} 
          onClick={() => onDrawingClick(drawing)}
          className="group relative bg-custom-light rounded-lg overflow-hidden
                   cursor-pointer transition-transform duration-300 hover:scale-105"
        >
          <div className="aspect-square">
            <img
              src={drawing.image}
              alt={drawing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-custom-dark/90 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-medium text-custom-highlight truncate">
                {drawing.title}
              </h3>
              <p className="text-sm text-gray-300 truncate">
                {drawing.author}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

EditDrawingsList.propTypes = {
  drawings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
  setDrawings: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

DrawingsPreview.propTypes = {
  drawings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDrawingClick: PropTypes.func.isRequired,
};

export default DrawingUpload;