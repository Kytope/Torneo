import PropTypes from 'prop-types';
import { TOURNAMENT_STATES } from '../utils/constants';

// Tipos básicos para los dibujos
export const Drawing = PropTypes.shape({
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
});

// Tipo para el estado del torneo
export const TournamentState = PropTypes.oneOf(Object.values(TOURNAMENT_STATES));

// Tipo para los grupos
export const Group = PropTypes.arrayOf(Drawing);

// Tipo para los brackets
export const Bracket = PropTypes.shape({
  match: PropTypes.number.isRequired,
  round: PropTypes.number.isRequired,
  drawing1: Drawing,
  drawing2: Drawing,
  winner: PropTypes.number,
});

// Tipo para el contexto del torneo
export const TournamentContextType = {
  drawings: PropTypes.arrayOf(Drawing).isRequired,
  setDrawings: PropTypes.func.isRequired,
  tournamentState: TournamentState.isRequired,
  setTournamentState: PropTypes.func.isRequired,
  groups: PropTypes.arrayOf(Group).isRequired,
  setGroups: PropTypes.func.isRequired,
  brackets: PropTypes.arrayOf(Bracket).isRequired,
  setBrackets: PropTypes.func.isRequired,
  selectedDrawing: PropTypes.oneOfType([Drawing, PropTypes.null]),
  setSelectedDrawing: PropTypes.func.isRequired,
};