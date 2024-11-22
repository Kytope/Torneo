// Función para crear grupos aleatorios
export const createGroups = (drawings, groupSize = 4) => {
    const shuffled = [...drawings].sort(() => 0.5 - Math.random());
    const groups = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      groups.push(shuffled.slice(i, i + groupSize));
    }
    
    return groups;
  };
  
  // Función para calcular posiciones en grupo
  export const calculateGroupStandings = (group, votes) => {
    return group.map(drawing => ({
      ...drawing,
      points: votes[drawing.id] || 0
    })).sort((a, b) => b.points - a.points);
  };
  
  // Función para crear brackets
  export const createBrackets = (qualifiedDrawings) => {
    const rounds = Math.ceil(Math.log2(qualifiedDrawings.length));
    const totalSlots = Math.pow(2, rounds);
    const brackets = [];
  
    for (let i = 0; i < totalSlots/2; i++) {
      brackets.push({
        match: i + 1,
        round: 1,
        drawing1: qualifiedDrawings[i * 2],
        drawing2: qualifiedDrawings[i * 2 + 1],
        winner: null
      });
    }
  
    return brackets;
  };
  
  // Función para actualizar brackets
  export const updateBrackets = (brackets, matchId, winner) => {
    const newBrackets = [...brackets];
    const matchIndex = newBrackets.findIndex(match => match.match === matchId);
    
    if (matchIndex !== -1) {
      newBrackets[matchIndex].winner = winner;
      // Crear siguiente ronda si es necesario
      // ... lógica para crear siguiente ronda
    }
    
    return newBrackets;
  };