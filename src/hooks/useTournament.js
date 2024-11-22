import { useContext } from 'react';
import { TournamentContext } from '../context/TournamentContext';

export const useTournament = () => {
  const context = useContext(TournamentContext);
  
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  
  return context;
};