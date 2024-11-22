import { useState, useEffect, useRef } from 'react';
import { useTournamentContext } from '../../../context/TournamentContext';
import PropTypes from 'prop-types';

export const Brackets = () => {
  const { bracketParticipants } = useTournamentContext();
  const [rounds, setRounds] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  useEffect(() => {
    const generateBrackets = (participants) => {
      const totalRounds = Math.ceil(Math.log2(participants.length));
      const newRounds = [];
      
      // Primera ronda
      const firstRound = [];
      for (let i = 0; i < participants.length; i += 2) {
        firstRound.push({
          id: `match-${1}-${i/2}`,
          round: 1,
          drawing1: participants[i],
          drawing2: participants[i + 1] || null,
          winner: null,
          completed: false
        });
      }
      newRounds.push(firstRound);

      // Generar rondas subsiguientes vacías
      for (let round = 2; round <= totalRounds; round++) {
        const roundMatches = [];
        const matchesInRound = Math.pow(2, totalRounds - round);
        
        for (let i = 0; i < matchesInRound; i++) {
          roundMatches.push({
            id: `match-${round}-${i}`,
            round: round,
            drawing1: null,
            drawing2: null,
            winner: null,
            completed: false
          });
        }
        newRounds.push(roundMatches);
      }

      setRounds(newRounds);
      if (firstRound.length > 0) {
        setCurrentMatch(firstRound[0]);
        setCurrentRoundIndex(0);
      }
    };

    generateBrackets(bracketParticipants);
  }, [bracketParticipants]);

  useEffect(() => {
    const audioElement = audioRef.current;
  
    if (winner && audioElement) {
      audioElement.volume = volume;
      audioElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.log('Error al reproducir audio:', error);
          setIsPlaying(false);
        });
    }
  
    return () => {
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
    };
  }, [winner, volume]);


  const handleVote = (matchId, drawingId) => {
    setRounds(prevRounds => {
      const newRounds = [...prevRounds];
      const roundIndex = newRounds.findIndex(round => 
        round.some(match => match.id === matchId)
      );
      const matchIndex = newRounds[roundIndex].findIndex(match => 
        match.id === matchId
      );

      // Actualizar el ganador del match actual
      const currentMatch = newRounds[roundIndex][matchIndex];
      currentMatch.winner = drawingId;
      currentMatch.completed = true;

      // Si hay siguiente ronda, actualizar el siguiente match
      if (roundIndex < newRounds.length - 1) {
        const nextRoundIndex = roundIndex + 1;
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const winningDrawing = drawingId === currentMatch.drawing1.id 
          ? currentMatch.drawing1 
          : currentMatch.drawing2;

        // Colocar al ganador en el siguiente match
        const nextMatch = newRounds[nextRoundIndex][nextMatchIndex];
        if (!nextMatch.drawing1) {
          nextMatch.drawing1 = winningDrawing;
        } else {
          nextMatch.drawing2 = winningDrawing;
        }
      } else {
        // Es la final
        setWinner(drawingId === currentMatch.drawing1.id 
          ? currentMatch.drawing1 
          : currentMatch.drawing2
        );
        // Iniciar la música cuando hay un ganador
        if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }

      // Encontrar el siguiente match no completado
      let nextMatch = null;
      let nextRoundIndex = roundIndex;
      
      // Primero buscar en la ronda actual
      nextMatch = newRounds[roundIndex].find((m, i) => 
        !m.completed && m.drawing1 && m.drawing2 && i > matchIndex
      );

      // Si no hay más matches en la ronda actual, buscar en las siguientes rondas
      if (!nextMatch) {
        for (let r = roundIndex + 1; r < newRounds.length; r++) {
          nextMatch = newRounds[r].find(m => 
            !m.completed && m.drawing1 && m.drawing2
          );
          if (nextMatch) {
            nextRoundIndex = r;
            break;
          }
        }
      }

      setCurrentMatch(nextMatch);
      setCurrentRoundIndex(nextRoundIndex);

      return newRounds;
    });
  };

  const getRoundName = (index, totalRounds) => {
    if (index === totalRounds - 1) return 'Final';
    if (index === totalRounds - 2) return 'Semifinal';
    if (index === totalRounds - 3) return 'Cuartos de Final';
    return `Ronda ${index + 1}`;
  };

  return (
    <div className="space-y-8">
      {/* Header con información del bracket */}
      <div className="bg-custom-medium rounded-xl p-4 shadow-lg border border-custom-accent/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-custom-highlight">Fase de Brackets</h2>
            <p className="text-gray-400 mt-1">
              {!winner ? (
                <span>
                  {rounds.flat().filter(m => m.completed).length} de{' '}
                  {rounds.flat().filter(m => m.drawing1 && m.drawing2).length} partidas completadas
                </span>
              ) : (
                <span className="text-custom-highlight">¡Torneo Completado!</span>
              )}
            </p>
          </div>
          
          {/* Controles de audio si hay ganador */}
          {winner && (
            <div className="flex items-center gap-4 bg-custom-light/30 p-2 rounded-lg">
              <button
                onClick={() => {
                  if (isPlaying) {
                    audioRef.current?.pause();
                  } else {
                    audioRef.current?.play();
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="p-2 rounded-full hover:bg-custom-light/50 transition-colors"
              >
                {isPlaying ? '🔇' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  if (audioRef.current) {
                    audioRef.current.volume = e.target.value;
                  }
                }}
                className="w-24"
              />
            </div>
          )}
        </div>
      </div>

      {/* Enfrentamiento Actual - La parte más importante */}
      {currentMatch && !winner && (
        <div className="bg-custom-medium rounded-xl shadow-lg border border-custom-accent/10">
          <div className="p-6 border-b border-custom-accent/10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-custom-highlight">
                {getRoundName(currentRoundIndex, rounds.length)}
              </h3>
              <span className="px-3 py-1 rounded-full bg-custom-light/30 text-custom-highlight text-sm">
                Match {rounds[currentRoundIndex].findIndex(m => m === currentMatch) + 1} de{' '}
                {rounds[currentRoundIndex].length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <VotingCard
                drawing={currentMatch.drawing1}
                isWinner={currentMatch.winner === currentMatch.drawing1?.id}
                onVote={() => handleVote(currentMatch.id, currentMatch.drawing1.id)}
                onFullScreen={setFullScreenImage}
                disabled={currentMatch.completed}
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold text-custom-highlight">VS</div>
                <div className="text-sm text-gray-400 text-center">
                  Selecciona el ganador del enfrentamiento
                </div>
              </div>
              
              <VotingCard
                drawing={currentMatch.drawing2}
                isWinner={currentMatch.winner === currentMatch.drawing2?.id}
                onVote={() => handleVote(currentMatch.id, currentMatch.drawing2.id)}
                onFullScreen={setFullScreenImage}
                disabled={currentMatch.completed}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visualización del Bracket */}
      <div className="bg-custom-medium rounded-xl p-6 shadow-lg border border-custom-accent/10">
        <h3 className="text-xl font-bold mb-6 text-custom-highlight">Árbol del Torneo</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-8 min-w-max p-4">
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="flex-1 min-w-[300px]">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-custom-highlight">
                    {getRoundName(roundIndex, rounds.length)}
                  </h4>
                </div>
                <div className="space-y-4">
                  {round.map((match) => (
                    <div 
                      key={match.id}
                      className={`p-4 rounded-lg transition-all
                        ${currentMatch === match
                          ? 'bg-custom-accent/20 ring-2 ring-custom-highlight'
                          : match.completed
                          ? 'bg-custom-light/20'
                          : 'bg-custom-light/10'
                        }`}
                    >
                      {match.drawing1 && match.drawing2 ? (
                        <>
                          <MatchParticipant
                            drawing={match.drawing1}
                            isWinner={match.winner === match.drawing1.id}
                            onImageClick={() => setFullScreenImage(match.drawing1)}
                          />
                          <div className="my-2 text-center text-sm text-custom-highlight">VS</div>
                          <MatchParticipant
                            drawing={match.drawing2}
                            isWinner={match.winner === match.drawing2.id}
                            onImageClick={() => setFullScreenImage(match.drawing2)}
                          />
                        </>
                      ) : (
                        <div className="h-24 flex items-center justify-center text-gray-500">
                          Esperando clasificados
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal del Ganador */}
      {winner && (
        <div className="fixed inset-0 bg-custom-dark/98 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full mx-4 space-y-8">
            <div className="text-center space-y-4">
              <div className="animate-bounce">
                <h2 className="text-6xl font-bold text-custom-highlight">
                  🏆 ¡Ganador del Torneo! 🏆
                </h2>
              </div>
              
              <div className="bg-gradient-to-b from-custom-medium to-custom-light/10 p-8 rounded-2xl
                            shadow-2xl transform hover:scale-105 transition-all">
                <img
                  src={winner.image}
                  alt={winner.title}
                  className="w-full max-h-[60vh] object-contain rounded-lg mb-6 cursor-pointer"
                  onClick={() => setFullScreenImage(winner)}
                />
                <h3 className="text-3xl font-bold text-custom-highlight mb-2">
                  {winner.title}
                </h3>
                <p className="text-xl text-gray-400">por {winner.author}</p>
              </div>
              
              <button
                onClick={() => setWinner(null)}
                className="px-6 py-3 bg-custom-highlight text-custom-dark rounded-lg
                         font-medium hover:bg-custom-highlight/90 transition-all"
              >
                Volver al Bracket
              </button>
            </div>
          </div>
        </div>
      )}

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

      <audio
        ref={audioRef}
        src="/victory.mp3"
        loop
        className="hidden"
      />
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

export default Brackets;