import { useState } from 'react';
import { useTournamentContext } from '../../context/TournamentContext';

export const DrawingGallery = () => {
  const { drawings, setSelectedDrawing } = useTournamentContext();
  const [fullScreenDrawing, setFullScreenDrawing] = useState(null);

  const openFullScreen = (drawing) => {
    setFullScreenDrawing(drawing);
    setSelectedDrawing(drawing);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {drawings.map(drawing => (
          <div
            key={drawing.id}
            className="relative bg-white p-2 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openFullScreen(drawing)}
          >
            <img
              src={drawing.image}
              alt={drawing.title}
              className="w-full h-48 object-cover rounded"
            />
            <div className="p-2">
              <h3 className="font-medium">{drawing.title}</h3>
              <p className="text-sm text-gray-600">{drawing.author}</p>
            </div>
          </div>
        ))}
      </div>

      {fullScreenDrawing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setFullScreenDrawing(null)}
        >
          <div className="max-w-4xl max-h-screen p-4">
            <img
              src={fullScreenDrawing.image}
              alt={fullScreenDrawing.title}
              className="max-h-[80vh] w-auto"
            />
            <div className="bg-white p-4 rounded mt-2">
              <h2 className="text-xl font-bold">{fullScreenDrawing.title}</h2>
              <p className="text-gray-600">{fullScreenDrawing.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};