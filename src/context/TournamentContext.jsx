import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

export const TOURNAMENT_STATES = {
  UPLOAD: 'UPLOAD',
  GROUP_PHASE: 'GROUP_PHASE',
  ROUND_ROBIN: 'ROUND_ROBIN',
  BRACKETS: 'BRACKETS'
};

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const [drawings, setDrawings] = useState([]);
  const [tournamentState, setTournamentState] = useState(TOURNAMENT_STATES.UPLOAD);
  const [groups, setGroups] = useState([]);
  const [bracketParticipants, setBracketParticipants] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  const value = {
    drawings,
    setDrawings,
    tournamentState,
    setTournamentState,
    groups,
    setGroups,
    bracketParticipants,
    setBracketParticipants,
    selectedDrawing,
    setSelectedDrawing,
    TOURNAMENT_STATES
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

TournamentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTournamentContext = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournamentContext must be used within a TournamentProvider');
  }
  return context;
};

export default TournamentContext;