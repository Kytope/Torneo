import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTournamentContext } from '../../../context/TournamentContext';

export const VotingInterface = ({ group }) => {
  const { setGroups } = useTournamentContext();
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  const handleVote = (drawingId) => {
    setGroups(prevGroups => {
      return prevGroups.map(currentGroup => {
        if (currentGroup === group) {
          return currentGroup.map(drawing => {
            if (drawing.id === drawingId) {
              return {
                ...drawing,
                votes: (drawing.votes || 0) + 1
              };
            }
            return drawing;
          });
        }
        return currentGroup;
      });
    });
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      {group.map(drawing => (
        <DrawingCard
          key={drawing.id}
          drawing={drawing}
          isSelected={selectedDrawing === drawing.id}
          onVote={() => handleVote(drawing.id)}
          onSelect={() => setSelectedDrawing(drawing.id)}
        />
      ))}
    </div>
  );
};

VotingInterface.propTypes = {
  group: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      votes: PropTypes.number,
      image: PropTypes.string.isRequired
    })
  ).isRequired
};

const DrawingCard = ({ drawing, isSelected, onVote, onSelect }) => {
  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <img 
        src={drawing.image} 
        alt={drawing.title}
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h4 className="font-medium">{drawing.title}</h4>
      <p className="text-sm text-gray-600">{drawing.author}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onVote();
        }}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Votar ({drawing.votes || 0})
      </button>
    </div>
  );
};

DrawingCard.propTypes = {
  drawing: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    votes: PropTypes.number,
    image: PropTypes.string.isRequired
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onVote: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
};