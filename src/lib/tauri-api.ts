import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import type { SaveInfo, Person, PersonUpdate, StudioUpdate } from './types';

export class TauriSaveManager {
  private currentPath: string | null = null;

  async openSaveFile(): Promise<{ info: SaveInfo } | null> {
    try {
      const selected = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      });

      if (!selected || typeof selected !== 'string') return null;

      const info = await invoke<SaveInfo>('load_save_file', { path: selected });
      this.currentPath = selected;
      
      return { info };
    } catch (err) {
      console.error('Failed to open file:', err);
      throw err;
    }
  }

  async saveSaveFile(): Promise<void> {
    if (!this.currentPath) throw new Error('No save file loaded');
    
    try {
      await invoke('save_save_file', { path: this.currentPath });
    } catch (err) {
      console.error('Failed to save file:', err);
      throw err;
    }
  }

  async saveSaveFileAs(): Promise<void> {
    try {
      const selected = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: this.currentPath || undefined,
      });

      if (!selected) return;

      await invoke('save_save_file', { path: selected });
      this.currentPath = selected;
    } catch (err) {
      console.error('Failed to save file as:', err);
      throw err;
    }
  }

  async getPersons(profession: string): Promise<Person[]> {
    try {
      return await invoke<Person[]>('get_persons', { profession });
    } catch (err) {
      console.error('Failed to get persons:', err);
      throw err;
    }
  }

  async updatePerson(
    profession: string,
    personId: string,
    update: PersonUpdate
  ): Promise<void> {
    try {
      await invoke('update_person', { 
        profession, 
        personId: personId.toString(), 
        update 
      });
    } catch (err) {
      console.error('Failed to update person:', err);
      throw err;
    }
  }

  async updateStudio(update: StudioUpdate): Promise<void> {
    try {
      await invoke('update_studio', { update });
    } catch (err) {
      console.error('Failed to update studio:', err);
      throw err;
    }
  }

  async getCurrentDate(): Promise<string> {
    try {
      return await invoke<string>('get_current_date');
    } catch (err) {
      console.error('Failed to get current date:', err);
      throw err;
    }
  }

  async getLanguageStrings(languageCode: string): Promise<string[]> {
    try {
      return await invoke<string[]>('get_language_strings', { languageCode });
    } catch (err) {
      console.error('Failed to get language strings:', err);
      throw err;
    }
  }

  async getGamePath(): Promise<string | null> {
    try {
      return await invoke<string | null>('get_game_path');
    } catch (err) {
      console.error('Failed to get game path:', err);
      throw err;
    }
  }

  async setGamePath(path: string): Promise<void> {
    try {
      await invoke('set_game_path', { path });
    } catch (err) {
      console.error('Failed to set game path:', err);
      throw err;
    }
  }

  getCurrentPath(): string | null {
    return this.currentPath;
  }

  isLoaded(): boolean {
    return this.currentPath !== null;
  }
}

export const saveManager = new TauriSaveManager();