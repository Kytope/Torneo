import PropTypes from 'prop-types';
import { TOURNAMENT_STATES } from '../utils/constants';

// Tipos básicos
export const DrawingType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
});

// Tipos para grupos y brackets
export const GroupType = PropTypes.arrayOf(DrawingType);

export const BracketType = PropTypes.shape({
  match: PropTypes.number.isRequired,
  round: PropTypes.number.isRequired,
  drawing1: DrawingType,
  drawing2: DrawingType,
  winner: PropTypes.number,
});

// Tipo para el estado del torneo
export const TournamentStateType = PropTypes.oneOf(
  Object.values(TOURNAMENT_STATES)
);

// Tipo para el contexto completo
export const TournamentContextType = {
  drawings: PropTypes.arrayOf(DrawingType).isRequired,
  setDrawings: PropTypes.func.isRequired,
  tournamentState: TournamentStateType.isRequired,
  setTournamentState: PropTypes.func.isRequired,
  groups: PropTypes.arrayOf(GroupType).isRequired,
  setGroups: PropTypes.func.isRequired,
  brackets: PropTypes.arrayOf(BracketType).isRequired,
  setBrackets: PropTypes.func.isRequired,
  selectedDrawing: PropTypes.oneOfType([DrawingType, PropTypes.null]),
  setSelectedDrawing: PropTypes.func.isRequired,
};