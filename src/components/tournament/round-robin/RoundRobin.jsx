import { useState, useEffect } from 'react';
import { useTournamentContext } from '../../../context/TournamentContext';
import PropTypes from 'prop-types';

export const RoundRobin = () => {
  const { 
    bracketParticipants,
    setTournamentState, 
    TOURNAMENT_STATES, 
    setBracketParticipants 
  } = useTournamentContext();

  const [qualifiedDrawings, setQualifiedDrawings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [roundRobinComplete, setRoundRobinComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeRoundRobin = async () => {
      setIsLoading(true);
      try {
        console.log('Participantes recibidos:', bracketParticipants);
        
        // Inicializar los dibujos con estadísticas
        const initializedDrawings = bracketParticipants.map(drawing => ({
          ...drawing,
          points: 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0
        }));
        
        setQualifiedDrawings(initializedDrawings);

        // Generar todos los enfrentamientos posibles y mezclarlos
        const generateRandomMatches = (participants) => {
          const roundRobinMatches = [];
          const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
          
          for (let i = 0; i < shuffledParticipants.length; i++) {
            for (let j = i + 1; j < shuffledParticipants.length; j++) {
              roundRobinMatches.push({
                drawing1: shuffledParticipants[i],
                drawing2: shuffledParticipants[j],
                winner: null,
                completed: false,
                matchNumber: roundRobinMatches.length + 1
              });
            }
          }
          
          // Mezclar los matches
          return roundRobinMatches.sort(() => Math.random() - 0.5);
        };

        const randomizedMatches = generateRandomMatches(initializedDrawings);
        
        // Simular un pequeño delay para mostrar la pantalla de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMatches(randomizedMatches);
        if (randomizedMatches.length > 0) {
          setCurrentMatch(randomizedMatches[0]);
        }
      } catch (error) {
        console.error('Error al inicializar Round Robin:', error);
        alert('Hubo un error al inicializar la fase Round Robin. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeRoundRobin();
  }, [bracketParticipants]);

  const getNextPowerOfTwo = (n) => {
    return Math.pow(2, Math.floor(Math.log2(n)));
  };

  const handleVote = (drawingId) => {
    if (!currentMatch || currentMatch.completed) return;

    console.log('Voto registrado para:', drawingId);

    // Actualizar el match actual
    setMatches(prevMatches => {
      const updatedMatches = prevMatches.map(match => {
        if (match === currentMatch) {
          return { ...match, winner: drawingId, completed: true };
        }
        return match;
      });

      // Encontrar el siguiente match no completado
      const nextMatch = updatedMatches.find(match => !match.completed);
      setCurrentMatch(nextMatch || null);

      return updatedMatches;
    });

    // Actualizar standings
    setQualifiedDrawings(prevDrawings => {
        return prevDrawings.map(drawing => {
          if (drawing.id === drawingId) {
            return {
              ...drawing,
              points: drawing.points + 3,
              matchesPlayed: drawing.matchesPlayed + 1,
              wins: drawing.wins + 1
            };
          }
          if (drawing.id === currentMatch.drawing1.id || drawing.id === currentMatch.drawing2.id) {
            if (drawing.id !== drawingId) {
              return {
                ...drawing,
                matchesPlayed: drawing.matchesPlayed + 1,
                losses: drawing.losses + 1
              };
            }
          }
          return drawing;
        });
      });
    };

    if (isLoading) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-custom-light rounded-full"></div>
            <div className="absolute inset-0 border-4 border-custom-highlight rounded-full 
                           animate-spin border-t-transparent"></div>
          </div>
          <div className="text-custom-highlight font-medium">
            Preparando Fase Round Robin...
          </div>
          <div className="text-sm text-gray-400 text-center max-w-md">
            Generando enfrentamientos aleatorios y preparando el torneo
          </div>
        </div>
      );
    }

  const completeRoundRobin = () => {
    // Verificar si todos los matches están completos
    if (matches.some(match => !match.completed)) {
      alert('Deben completarse todos los enfrentamientos');
      return;
    }

    // Ordenar por puntos y seleccionar los necesarios para el próximo bracket
    const nextBracketSize = getNextPowerOfTwo(qualifiedDrawings.length);
    const sortedDrawings = [...qualifiedDrawings]
      .sort((a, b) => b.points - a.points)
      .slice(0, nextBracketSize);

    // Guardar los participantes clasificados para los brackets
    setBracketParticipants(sortedDrawings);
    setRoundRobinComplete(true);
  };

  const advanceToBrackets = () => {
    setTournamentState(TOURNAMENT_STATES.BRACKETS);
  };

  return (
    <div className="space-y-8">
      {/* Header con progreso */}
      <div className="bg-custom-medium rounded-xl p-4 shadow-lg border border-custom-accent/10">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-custom-highlight">Fase Round Robin</h2>
            <p className="text-gray-400">
              {matches.filter(m => m.completed).length} de {matches.length} partidos jugados
            </p>
          </div>
          {!roundRobinComplete && matches.length > 0 && (
            <button
              onClick={completeRoundRobin}
              className="px-4 py-2 bg-custom-highlight text-custom-dark rounded-lg
                       font-medium hover:bg-custom-highlight/90 transition-all"
            >
              Finalizar Round Robin
            </button>
          )}
        </div>
      </div>

      {/* Enfrentamiento Actual - Componente Principal */}
      {currentMatch && !roundRobinComplete ? (
        <div className="bg-custom-medium rounded-xl shadow-lg border border-custom-accent/10">
          <div className="p-6 border-b border-custom-accent/10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-custom-highlight">
                Enfrentamiento Actual
              </h3>
              <span className="px-3 py-1 rounded-full bg-custom-light text-custom-highlight text-sm">
                {matches.filter(m => m.completed).length + 1} de {matches.length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <VotingCard
                drawing={currentMatch.drawing1}
                onVote={handleVote}
                isWinner={currentMatch.winner === currentMatch.drawing1.id}
                disabled={currentMatch.completed}
                onFullScreen={setFullScreenImage}
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold text-custom-highlight">VS</div>
                <div className="text-sm text-gray-400 text-center">
                  Selecciona el dibujo ganador
                </div>
              </div>
              
              <VotingCard
                drawing={currentMatch.drawing2}
                onVote={handleVote}
                isWinner={currentMatch.winner === currentMatch.drawing2.id}
                disabled={currentMatch.completed}
                onFullScreen={setFullScreenImage}
              />
            </div>
          </div>
        </div>
      ) : roundRobinComplete ? (
        <div className="text-center p-8 bg-custom-medium rounded-xl shadow-lg">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-custom-highlight">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-100">
              Round Robin Completado
            </h3>
            <p className="text-gray-400">
              Los {getNextPowerOfTwo(qualifiedDrawings.length)} mejores dibujos avanzarán 
              a la fase de brackets
            </p>
            <button
              onClick={advanceToBrackets}
              className="px-8 py-3 bg-custom-highlight text-custom-dark rounded-lg
                       font-medium hover:bg-custom-highlight/90 transition-all"
            >
              Comenzar Brackets
            </button>
          </div>
        </div>
      ) : null}

      {/* Grid de 2 columnas para información complementaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tabla de posiciones */}
        <div className="bg-custom-medium rounded-xl shadow-lg border border-custom-accent/10">
          <div className="p-4 border-b border-custom-accent/10">
            <h3 className="text-lg font-bold text-custom-highlight">
              Tabla de Posiciones
            </h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-custom-light/30">
                    <th className="px-4 py-2 text-left">Pos</th>
                    <th className="px-4 py-2 text-left">Dibujo</th>
                    <th className="px-4 py-2 text-center">PJ</th>
                    <th className="px-4 py-2 text-center">G</th>
                    <th className="px-4 py-2 text-center">P</th>
                    <th className="px-4 py-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-custom-light/10">
                  {qualifiedDrawings
                    .sort((a, b) => b.points - a.points)
                    .map((drawing, index) => (
                      <tr 
                        key={drawing.id} 
                        className={`hover:bg-custom-light/10 transition-colors
                          ${index < getNextPowerOfTwo(qualifiedDrawings.length)
                            ? 'bg-custom-light/5' 
                            : ''
                          }`}
                      >
                        <td className="px-4 py-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                            ${index < getNextPowerOfTwo(qualifiedDrawings.length)
                              ? 'bg-custom-highlight text-custom-dark'
                              : 'bg-custom-light/30 text-gray-300'
                            }`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={drawing.image} 
                              alt={drawing.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div className="truncate">
                              <div className="font-medium text-sm text-gray-100 truncate">
                                {drawing.title}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {drawing.author}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">{drawing.matchesPlayed}</td>
                        <td className="px-4 py-2 text-center text-custom-highlight">{drawing.wins}</td>
                        <td className="px-4 py-2 text-center text-red-400">{drawing.losses}</td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center">
                            <span className="px-2 py-1 rounded-full bg-custom-light/30 
                                         text-custom-highlight font-bold text-sm">
                              {drawing.points}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Historial de enfrentamientos */}
        <div className="bg-custom-medium rounded-xl shadow-lg border border-custom-accent/10">
          <div className="p-4 border-b border-custom-accent/10">
            <h3 className="text-lg font-bold text-custom-highlight">
              Historial de Enfrentamientos
            </h3>
          </div>
          <div className="p-4">
            <div className="grid gap-4">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg transition-all
                    ${match.completed
                      ? 'bg-custom-light/20'
                      : currentMatch === match
                      ? 'bg-custom-accent/20 ring-1 ring-custom-highlight'
                      : 'bg-custom-light/10'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-custom-highlight">
                      Partido {index + 1}
                    </span>
                    {match.completed && (
                      <span className="px-2 py-1 text-xs rounded-full bg-custom-highlight/20 
                                   text-custom-highlight">
                        Completado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <MatchParticipant
                      drawing={match.drawing1}
                      isWinner={match.winner === match.drawing1.id}
                      onImageClick={() => setFullScreenImage(match.drawing1)}
                    />
                    <div className="text-sm text-custom-highlight">VS</div>
                    <MatchParticipant
                      drawing={match.drawing2}
                      isWinner={match.winner === match.drawing2.id}
                      onImageClick={() => setFullScreenImage(match.drawing2)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen completa */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 bg-custom-dark/95 flex items-center justify-center z-50"
          onClick={() => setFullScreenImage(null)}
        >
          <div 
            className="max-w-7xl max-h-[90vh] p-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-custom-medium text-custom-highlight
                       rounded-full flex items-center justify-center hover:bg-custom-light
                       transition-colors"
            >
              ✕
            </button>
            <img
              src={fullScreenImage.image}
              alt={fullScreenImage.title}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
            <div className="mt-4 bg-custom-medium p-4 rounded-lg">
              <h2 className="text-xl font-bold text-custom-highlight">
                {fullScreenImage.title}
              </h2>
              <p className="text-gray-300 mt-1">{fullScreenImage.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VotingCard = ({ drawing, isWinner, onVote, disabled, onFullScreen }) => {
  return (
    <div 
      className={`w-full max-w-md rounded-xl overflow-hidden transition-all
        ${isWinner 
          ? 'ring-2 ring-custom-highlight shadow-lg shadow-custom-highlight/20' 
          : 'bg-custom-light/50'
        }`}
    >
      <div 
        className="relative cursor-pointer group"
        onClick={() => onFullScreen(drawing)}
      >
        <img
          src={drawing.image}
          alt={drawing.title}
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-custom-dark/80 via-transparent to-transparent 
                     opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm text-gray-300">Click para ver en pantalla completa</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-custom-light/10">
        <h4 className="font-medium text-lg text-custom-highlight mb-1 truncate">
          {drawing.title}
        </h4>
        <p className="text-sm text-gray-400 mb-4 truncate">{drawing.author}</p>
        
        {!disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote(drawing.id);
            }}
            className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300
                     bg-custom-highlight text-custom-dark hover:bg-custom-highlight/90
                     transform hover:scale-105 active:scale-95"
          >
            Votar
          </button>
        )}
        
        {isWinner && (
          <div className="flex items-center justify-center gap-2 text-custom-highlight mt-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Ganador</span>
          </div>
        )}
      </div>
    </div>
  );
};

const MatchParticipant = ({ drawing, isWinner, onImageClick }) => {
  return (
    <div className={`flex-1 p-3 rounded-lg transition-all
      ${isWinner ? 'bg-custom-highlight/20 ring-1 ring-custom-highlight' : 'bg-custom-light/10'}`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer
                   transition-transform hover:scale-105"
          onClick={() => onImageClick(drawing)}
        >
          <img
            src={drawing.image}
            alt={drawing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-200 truncate">{drawing.title}</h4>
          <p className="text-sm text-gray-400 truncate">{drawing.author}</p>
        </div>
        {isWinner && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-custom-highlight/20 
                          flex items-center justify-center">
              <svg className="w-5 h-5 text-custom-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

VotingCard.propTypes = {
  drawing: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  isWinner: PropTypes.bool,
  onVote: PropTypes.func.isRequired,
  onFullScreen: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

VotingCard.defaultProps = {
  isWinner: false,
  disabled: false,
};

MatchParticipant.propTypes = {
  drawing: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  isWinner: PropTypes.bool,
  onImageClick: PropTypes.func.isRequired,
};

MatchParticipant.defaultProps = {
  isWinner: false,
};

export default RoundRobin;