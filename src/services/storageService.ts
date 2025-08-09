import type { User } from '../types/api';

// Clés pour localStorage
const STORAGE_KEYS = {
  USER: 'myfreightlab_user',
  TOKEN: 'myfreightlab_token'
} as const;

// Service de gestion du localStorage pour l'authentification
export class StorageService {
  // Sauvegarder les informations d'authentification
  static saveAuth(user: User, token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en localStorage:', error);
    }
  }

  // Récupérer les informations d'authentification
  static getAuth(): { user: User | null; token: string | null } {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (!userStr || !token) {
        return { user: null, token: null };
      }

      const user: User = JSON.parse(userStr);
      return { user, token };
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return { user: null, token: null };
    }
  }

  // Supprimer les informations d'authentification
  static clearAuth(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Erreur lors de la suppression du localStorage:', error);
    }
  }

  // Vérifier si des informations d'authentification existent
  static hasAuth(): boolean {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      return !!(user && token);
    } catch (error) {
      console.error('Erreur lors de la vérification du localStorage:', error);
      return false;
    }
  }

  // Mettre à jour uniquement l'utilisateur (garde le même token)
  static updateUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  }
}
