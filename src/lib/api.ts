import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import type { 
  SaveInfo, 
  Person, 
  PersonUpdate, 
  StudioUpdate, 
  CompetitorStudio, 
  CompetitorUpdate 
} from './types';

export class SaveManager {
  private currentPath: string | null = null;

  // ───────────────────────────────────────────────────────────────────────────
  // File Operations
  // ───────────────────────────────────────────────────────────────────────────

  async openSaveFile(): Promise<{ info: SaveInfo } | null> {
    const selected = await open({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      multiple: false,
    });

    if (!selected || typeof selected !== 'string') return null;

    const info = await invoke<SaveInfo>('load_save_file', { path: selected });
    this.currentPath = selected;

    return { info };
  }

  async saveSaveFile(): Promise<void> {
    if (!this.currentPath) throw new Error('No save file loaded');
    await invoke('save_save_file', { path: this.currentPath });
  }

  async saveSaveFileAs(): Promise<void> {
    const selected = await save({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      defaultPath: this.currentPath || undefined,
    });

    if (!selected) return;

    await invoke('save_save_file', { path: selected });
    this.currentPath = selected;
  }

  async reloadSaveFile(): Promise<{ info: SaveInfo } | null> {
    if (!this.currentPath) return null;
    const info = await invoke<SaveInfo>('load_save_file', { path: this.currentPath });
    return { info };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Person Operations
  // ───────────────────────────────────────────────────────────────────────────

  async getPersons(profession: string): Promise<Person[]> {
    return invoke<Person[]>('get_persons', { profession });
  }

  async updatePerson(profession: string, personId: string, update: PersonUpdate): Promise<void> {
    await invoke('update_person', {
      profession,
      personId: personId.toString(),
      update,
    });
  }

  async updatePeople(profession: string, studioId: string, field: string, value: number): Promise<number> {
    return invoke<number>('update_people', {
      profession,
      studioId,
      field,
      value,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Studio Operations
  // ───────────────────────────────────────────────────────────────────────────

  async updateStudio(update: StudioUpdate): Promise<void> {
    await invoke('update_studio', { update });
  }

  async getResources(): Promise<Record<string, number>> {
    return invoke<Record<string, number>>('get_resources');
  }

  async updateResource(resourceId: string, value: number): Promise<void> {
    await invoke('update_resource', { resourceId, value });
  }

  async getTitans(): Promise<Record<string, number>> {
    return invoke<Record<string, number>>('get_titans');
  }

  async updateTitan(titanId: string, value: number): Promise<void> {
    await invoke('update_titan', { titanId, value });
  }

  async getCompetitors(): Promise<CompetitorStudio[]> {
    return invoke<CompetitorStudio[]>('get_competitors');
  }

  async updateCompetitor(competitorId: string, update: CompetitorUpdate): Promise<void> {
    await invoke('update_competitor', { competitorId, update });
  }

  async getTimeBonuses(): Promise<Record<string, number>> {
    return invoke<Record<string, number>>('get_time_bonuses');
  }

  async updateTimeBonus(department: string, value: number): Promise<void> {
    await invoke('update_time_bonus', { department, value });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Game Data Operations
  // ───────────────────────────────────────────────────────────────────────────

  async getCurrentDate(): Promise<string> {
    return invoke<string>('get_current_date');
  }

  async getLanguageStrings(languageCode: string): Promise<string[]> {
    return invoke<string[]>('get_language_strings', { languageCode });
  }

  async getGamePath(): Promise<string | null> {
    return invoke<string | null>('get_game_path');
  }

  async setGamePath(path: string): Promise<void> {
    await invoke('set_game_path', { path });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // State Accessors
  // ───────────────────────────────────────────────────────────────────────────

  getCurrentPath(): string | null {
    return this.currentPath;
  }

  isLoaded(): boolean {
    return this.currentPath !== null;
  }
}

export const saveManager = new SaveManager();
