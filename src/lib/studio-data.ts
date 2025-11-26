export interface Studio {
  id: string;
  name: string;
  icon: string;
}

export const OPPONENT_STUDIOS: Studio[] = [
  { id: 'GB', name: 'Gerstein Brothers', icon: 'GB.png' },
  { id: 'EM', name: 'Evergreen Movies', icon: 'EM.png' },
  { id: 'SU', name: 'Supreme', icon: 'SU.png' },
  { id: 'HE', name: 'Hephaestus', icon: 'HE.png' },
  { id: 'MA', name: 'Marginese', icon: 'MA.png' },
];

// Helper function to get studio name by ID
export function getStudioName(studioId: string | null | undefined): string | undefined {
  if (!studioId) return undefined;
  return OPPONENT_STUDIOS.find(s => s.id === studioId)?.name;
}

// Helper function to get studio by ID
export function getStudio(studioId: string | null | undefined): Studio | undefined {
  if (!studioId) return undefined;
  return OPPONENT_STUDIOS.find(s => s.id === studioId);
}
