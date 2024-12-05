import { useState, useEffect } from 'react';
import { useTournamentContext } from '../../../context/TournamentContext';
import PropTypes from 'prop-types';

export const GroupPhase = () => {
  const { 
    drawings, 
    setTournamentState, 
    TOURNAMENT_STATES,
    setBracketParticipants 
  } = useTournamentContext();
  
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    const distributeDrawings = (drawings) => {
      const totalDrawings = drawings.length;
      
      // Función para verificar si una distribución es válida
      const isValidDistribution = (g4, g3) => {
        return (g4 * 4 + g3 * 3) === totalDrawings;
      };
  
      // Función para encontrar la distribución óptima
      const findOptimalDistribution = (total) => {
        let maxGroups4 = Math.floor(total / 4);
        
        for (let groups4 = maxGroups4; groups4 >= 0; groups4--) {
          const remainingPlayers = total - (groups4 * 4);
          if (remainingPlayers % 3 === 0) {
            const groups3 = remainingPlayers / 3;
            if (isValidDistribution(groups4, groups3)) {
              return {
                groupsOf4: groups4,
                groupsOf3: groups3,
                totalParticipants: total,
                expectedQualifiers: (groups4 * 2) + groups3
              };
            }
          }
        }
        
        throw new Error(`No se encontró una distribución válida para ${total} participantes`);
      };
  
      // Calculamos la distribución
      const distribution = findOptimalDistribution(totalDrawings);
      const shuffledDrawings = [...drawings].sort(() => Math.random() - 0.5);
      const groups = [];
      let currentIndex = 0;
  
      // Creamos los grupos de 4
      for (let i = 0; i < distribution.groupsOf4; i++) {
        groups.push(
          shuffledDrawings.slice(currentIndex, currentIndex + 4).map(drawing => ({
            ...drawing,
            wins: 0,
            losses: 0,
            points: 0,
            matchesPlayed: 0
          }))
        );
        currentIndex += 4;
      }
  
      // Creamos los grupos de 3
      for (let i = 0; i < distribution.groupsOf3; i++) {
        groups.push(
          shuffledDrawings.slice(currentIndex, currentIndex + 3).map(drawing => ({
            ...drawing,
            wins: 0,
            losses: 0,
            points: 0,
            matchesPlayed: 0
          }))
        );
        currentIndex += 3;
      }
  
      return groups;
    };
  
    // Función para generar matches aleatorios para un grupo
    const generateRandomMatches = (group) => {
      const matches = [];
      const participants = [...group];
      
      // Generamos todos los posibles enfrentamientos
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          matches.push({
            drawing1: participants[i],
            drawing2: participants[j],
            winner: null,
            completed: false
          });
        }
      }
      
      // Mezclamos los matches de forma aleatoria
      return matches.sort(() => Math.random() - 0.5);
    };
  
    try {
      const groupedDrawings = distributeDrawings(drawings);
      setGroups(groupedDrawings);
  
      // Generar enfrentamientos aleatorios para cada grupo
      const allMatches = groupedDrawings.map(group => generateRandomMatches(group));
  
      setMatches(allMatches);
      if (allMatches[0] && allMatches[0][0]) {
        setCurrentMatch(allMatches[0][0]);
      }
    } catch (error) {
      console.error('Error al distribuir los grupos:', error);
      alert('Hubo un error al distribuir los grupos. Por favor, inténtalo de nuevo.');
    }
  }, [drawings]);

  const getNextPowerOfTwo = (n) => {
    return Math.pow(2, Math.floor(Math.log2(n)));
  };

  const determineNextPhase = (qualifiedDrawings) => {
    // Encontrar la siguiente potencia de 2 menor o igual al número de clasificados
    const nextPowerOfTwo = getNextPowerOfTwo(qualifiedDrawings.length);
    const nextHigherPowerOfTwo = nextPowerOfTwo * 2;

    console.log('Número de clasificados:', qualifiedDrawings.length);
    console.log('Siguiente potencia de 2:', nextPowerOfTwo);
    console.log('Siguiente potencia de 2 superior:', nextHigherPowerOfTwo);

    // Si el número de clasificados es exactamente una potencia de 2, ir a brackets
    if (qualifiedDrawings.length === nextPowerOfTwo) {
      return TOURNAMENT_STATES.BRACKETS;
    }
    
    // Si el número está entre dos potencias de 2, ir a round robin
    if (qualifiedDrawings.length > nextPowerOfTwo && qualifiedDrawings.length < nextHigherPowerOfTwo) {
      return TOURNAMENT_STATES.ROUND_ROBIN;
    }

    // Por defecto, ir a brackets
    return TOURNAMENT_STATES.BRACKETS;
  };
  const handleVote = (drawingId) => {
    if (!currentMatch || currentMatch.completed) return;
  
    // Actualizar el match actual y encontrar el siguiente
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const groupMatches = [...newMatches[selectedGroup]];
      const matchIndex = groupMatches.findIndex(m => 
        m.drawing1.id === currentMatch.drawing1.id && 
        m.drawing2.id === currentMatch.drawing2.id
      );
  
      // Marcar el match actual como completado
      groupMatches[matchIndex] = {
        ...groupMatches[matchIndex],
        winner: drawingId,
        completed: true
      };
      newMatches[selectedGroup] = groupMatches;
  
      // Encontrar el siguiente match no completado
      const nextMatch = groupMatches.find((match, index) => 
        index > matchIndex && !match.completed
      );
      
      // Actualizar el match actual
      if (nextMatch) {
        setCurrentMatch(nextMatch);
      } else {
        setCurrentMatch(null);
      }
  
      return newMatches;
    });
  
    // Actualizar los puntos en el grupo
    setGroups(prevGroups => {
      const newGroups = [...prevGroups];
      const group = [...newGroups[selectedGroup]];
      
      // Encontrar los índices del ganador y perdedor
      const winnerIndex = group.findIndex(d => d.id === drawingId);
      const loserIndex = group.findIndex(d => 
        d.id === (drawingId === currentMatch.drawing1.id 
          ? currentMatch.drawing2.id 
          : currentMatch.drawing1.id)
      );
  
      // Actualizar las estadísticas del ganador
      group[winnerIndex] = {
        ...group[winnerIndex],
        points: (group[winnerIndex].points || 0) + 3,
        matchesPlayed: (group[winnerIndex].matchesPlayed || 0) + 1,
        wins: (group[winnerIndex].wins || 0) + 1
      };
  
      // Actualizar las estadísticas del perdedor
      group[loserIndex] = {
        ...group[loserIndex],
        matchesPlayed: (group[loserIndex].matchesPlayed || 0) + 1,
        losses: (group[loserIndex].losses || 0) + 1
      };
  
      newGroups[selectedGroup] = group;
      return newGroups;
    });
  
    // Verificar si el grupo actual está completo
    const isGroupComplete = matches[selectedGroup].every((match, idx) => {
      return idx === matches[selectedGroup].length - 1 
        ? match.winner === drawingId 
        : match.completed;
    });
  
    if (isGroupComplete) {
      if (selectedGroup < groups.length - 1) {
        // Cambiar al siguiente grupo automáticamente después de un breve delay
        setTimeout(() => {
          setSelectedGroup(prev => prev + 1);
          const nextGroupFirstMatch = matches[selectedGroup + 1].find(m => !m.completed);
          setCurrentMatch(nextGroupFirstMatch);
        }, 1000);
      }
    }
  };

  const handleGroupComplete = () => {
    const allMatchesCompleted = matches[selectedGroup].every(match => match.completed);
    if (!allMatchesCompleted) {
      alert('Deben completarse todos los enfrentamientos del grupo');
      return;
    }
    
    if (selectedGroup < groups.length - 1) {
      setSelectedGroup(selectedGroup + 1);
      setCurrentMatch(matches[selectedGroup + 1][0]);
    } else {
      // Todos los grupos completados
      const qualifiedDrawings = groups.flatMap(group => {
        const sortedGroup = [...group].sort((a, b) => b.points - a.points);
        // Clasificar según el tamaño del grupo
        return group.length <= 3 ? sortedGroup.slice(0, 1) : sortedGroup.slice(0, 2);
      });
  
      const nextPhase = determineNextPhase(qualifiedDrawings);
      
      if (nextPhase === TOURNAMENT_STATES.ROUND_ROBIN) {
        setBracketParticipants(qualifiedDrawings);
      } else {
        const nextPowerOfTwo = getNextPowerOfTwo(qualifiedDrawings.length);
        setBracketParticipants(qualifiedDrawings.slice(0, nextPowerOfTwo));
      }
  
      setTournamentState(nextPhase);
    }
  };

  return (
    <div className="space-y-8">
      {/* Navegación de grupos - Compacta en la parte superior */}
      <div className="bg-custom-medium rounded-xl p-4 shadow-lg border border-custom-accent/10">
        <div className="flex flex-wrap gap-2">
          {groups.map((group, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedGroup(index);
                setCurrentMatch(matches[index].find(match => !match.completed) || null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedGroup === index 
                  ? 'bg-custom-highlight text-custom-dark shadow-lg scale-105' 
                  : 'bg-custom-light hover:bg-custom-accent text-gray-300'
                }`}
            >
              Grupo {index + 1}
              <span className="ml-1 opacity-75">({group.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Área de enfrentamiento actual - Ahora es lo primero que se ve */}
      {currentMatch ? (
        <div className="bg-custom-medium rounded-xl shadow-lg border border-custom-accent/10">
          <div className="p-6 border-b border-custom-accent/10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-custom-highlight">
                Enfrentamiento Actual - Grupo {selectedGroup + 1}
              </h3>
              <span className="px-3 py-1 rounded-full bg-custom-light text-custom-highlight text-sm">
                {matches[selectedGroup]?.filter(m => m.completed).length + 1} de {matches[selectedGroup]?.length}
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
      ) : (
        <div className="text-center p-8 bg-custom-medium rounded-xl shadow-lg border border-custom-accent/10">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-custom-highlight">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-100">
              Grupo Completado
            </h3>
            <p className="text-gray-400">
              {selectedGroup < groups.length - 1 
                ? 'Puedes continuar con el siguiente grupo'
                : 'Has completado todos los grupos. ¡Hora de pasar a la siguiente fase!'
              }
            </p>
            <button
              onClick={handleGroupComplete}
              className="px-8 py-3 bg-custom-highlight text-custom-dark rounded-lg
                       font-medium hover:bg-custom-highlight/90 transition-all"
            >
              {selectedGroup < groups.length - 1 ? 'Siguiente Grupo' : 'Finalizar Fase de Grupos'}
            </button>
          </div>
        </div>
      )}

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
                  {groups[selectedGroup]?.sort((a, b) => b.points - a.points).map((drawing, index) => (
                    <tr 
                      key={drawing.id} 
                      className={`hover:bg-custom-light/10 transition-colors
                        ${index < (groups[selectedGroup].length <= 3 ? 1 : 2) 
                          ? 'bg-custom-light/5' 
                          : ''
                        }`}
                    >
                      <td className="px-4 py-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                          ${index < (groups[selectedGroup].length <= 3 ? 1 : 2)
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
                          <span className="px-2 py-1 rounded-full bg-custom-light/30 text-custom-highlight font-bold text-sm">
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
              {matches[selectedGroup]?.map((match, index) => (
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
                      <span className="px-2 py-1 text-xs rounded-full bg-custom-highlight/20 text-custom-highlight">
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
            onClick={() => onVote(drawing.id)}
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
    <div className={`p-2 rounded-lg transition-all
      ${isWinner ? 'bg-custom-highlight/20 ring-1 ring-custom-highlight' : 'bg-custom-light/10'}`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded overflow-hidden cursor-pointer
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
          <h4 className="font-medium text-sm text-gray-200 truncate">{drawing.title}</h4>
          <p className="text-xs text-gray-400 truncate">{drawing.author}</p>
        </div>
        {isWinner && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-custom-highlight/20 
                          flex items-center justify-center">
              <svg className="w-4 h-4 text-custom-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

export default GroupPhase;