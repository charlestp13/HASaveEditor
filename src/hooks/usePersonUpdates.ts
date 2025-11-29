import { useCallback } from 'react';
import { saveManager, PersonStateUpdater, type Person } from '@/lib';

type SetPersons = React.Dispatch<React.SetStateAction<Person[]>>;

interface UsePersonUpdatesOptions {
  profession: string;
  setAllPersons: SetPersons;
  onError: (err: unknown, fallback: string) => void;
}

export function usePersonUpdates({ 
  profession, 
  setAllPersons, 
  onError 
}: UsePersonUpdatesOptions) {
  
  const updatePersonLocal = useCallback(
    (personId: string | number, updater: (person: Person) => Person) => {
      setAllPersons(prev => prev.map(p => (p.id === personId ? updater(p) : p)));
    },
    [setAllPersons]
  );

  const handlePersonUpdate = useCallback(
    (personId: string | number, field: string, value: number | null) => {
      updatePersonLocal(personId, p => PersonStateUpdater.updateField(p, field, value));
    },
    [updatePersonLocal]
  );

  const handleStringFieldUpdate = useCallback(
    (personId: string | number, field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => {
      updatePersonLocal(personId, p => PersonStateUpdater.updateStringField(p, field, value));
      
      const updateValue = field === 'customName' ? (value ?? '') : value;
      saveManager
        .updatePerson(profession, String(personId), { [field]: updateValue })
        .catch(err => onError(err, `Failed to update ${field}`));
    },
    [profession, updatePersonLocal, onError]
  );

  const handleTraitAdd = useCallback(
    (personId: string | number, trait: string) => {
      updatePersonLocal(personId, p => PersonStateUpdater.addTrait(p, trait));
      
      saveManager
        .updatePerson(profession, String(personId), { addTrait: trait })
        .catch(err => onError(err, 'Failed to add trait'));
    },
    [profession, updatePersonLocal, onError]
  );

  const handleTraitRemove = useCallback(
    (personId: string | number, trait: string) => {
      updatePersonLocal(personId, p => PersonStateUpdater.removeTrait(p, trait));
      
      saveManager
        .updatePerson(profession, String(personId), { removeTrait: trait })
        .catch(err => onError(err, 'Failed to remove trait'));
    },
    [profession, updatePersonLocal, onError]
  );

  const handlePortraitChange = useCallback(
    (personId: string | number, portraitId: number) => {
      updatePersonLocal(personId, p => ({ ...p, portraitBaseId: portraitId }));
      
      saveManager
        .updatePerson(profession, String(personId), { portraitBaseId: portraitId })
        .catch(err => onError(err, 'Failed to update portrait'));
    },
    [profession, updatePersonLocal, onError]
  );

  return {
    handlePersonUpdate,
    handleStringFieldUpdate,
    handleTraitAdd,
    handleTraitRemove,
    handlePortraitChange,
  };
}
