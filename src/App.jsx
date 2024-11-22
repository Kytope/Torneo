import { useTournamentContext } from './context/TournamentContext';
import { DrawingUpload } from './components/upload/DrawingUpload';
import { GroupPhase } from './components/tournament/group-phase/GroupPhase';
import { RoundRobin } from './components/tournament/round-robin/RoundRobin';
import { Brackets } from './components/tournament/brackets/Brackets';

function App() {
  const { tournamentState, setTournamentState, TOURNAMENT_STATES } = useTournamentContext();

  const formatPhaseText = (phase) => {
    return phase.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-custom-dark">
      {/* Header */}
      <header className="bg-custom-medium sticky top-0 z-50 shadow-lg border-b border-custom-highlight/10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-custom-highlight">
                Torneo de Dibujos
              </h1>
              <div className="text-sm text-custom-highlight/70 mt-1">
                {formatPhaseText(tournamentState)}
              </div>
            </div>
            
            {/* Phase Indicator */}
            <div className="hidden md:flex items-center gap-3">
              {Object.values(TOURNAMENT_STATES).map((state, index) => (
                <div key={state} className="flex items-center">
                  <div 
                    className={`h-2 w-2 rounded-full ${
                      state === tournamentState 
                        ? 'bg-custom-highlight animate-pulse' 
                        : 'bg-custom-light'
                    }`}
                  />
                  {index < Object.values(TOURNAMENT_STATES).length - 1 && (
                    <div className="h-[1px] w-8 bg-custom-light/30 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-custom-medium rounded-xl shadow-xl p-6 ring-1 ring-custom-highlight/5">
          {tournamentState === TOURNAMENT_STATES.UPLOAD && <DrawingUpload />}
          {tournamentState === TOURNAMENT_STATES.GROUP_PHASE && <GroupPhase />}
          {tournamentState === TOURNAMENT_STATES.ROUND_ROBIN && <RoundRobin />}
          {tournamentState === TOURNAMENT_STATES.BRACKETS && <Brackets />}
        </div>
      </main>

      {/* Navigation Bar */}
      {tournamentState !== TOURNAMENT_STATES.UPLOAD && (
        <nav className="fixed bottom-0 left-0 right-0 bg-custom-dark/95 border-t border-custom-highlight/10 backdrop-blur supports-[backdrop-filter]:bg-custom-dark/60">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center gap-4">
              {Object.values(TOURNAMENT_STATES).slice(1).map((state) => (
                <button
                  key={state}
                  onClick={() => setTournamentState(state)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-300 flex-1
                    ${tournamentState === state
                      ? 'bg-custom-highlight text-custom-dark shadow-lg shadow-custom-highlight/20 scale-105'
                      : 'bg-custom-light text-gray-300 hover:bg-custom-accent hover:text-custom-highlight'
                    }
                  `}
                >
                  {formatPhaseText(state)}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-custom-dark">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-custom-dark via-custom-medium to-custom-accent opacity-50" 
          style={{
            maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)'
          }}
        />
      </div>
    </div>
  );
}

export default App;