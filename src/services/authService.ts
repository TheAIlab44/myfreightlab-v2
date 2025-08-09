import { login, logout, signUp, resetPassword } from '../api';
import { getCurrentUser } from '../api/services/supabaseService';
import { StorageService } from './storageService';
import type { LoginRequest, LoginResponse, User } from '../types/api';

// Service d'authentification
export class AuthService {
  // Connexion
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await login(credentials);
    
    // Sauvegarder en localStorage si succès
    if (response.success && response.user && response.token) {
      const userWithLogin: User = {
        ...response.user,
        isLoggedIn: true
      };
      StorageService.saveAuth(userWithLogin, response.token);
    }
    
    return response;
  }

  // Déconnexion
  static async logout(): Promise<{ success: boolean }> {
    const result = await logout();
    
    // Nettoyer le localStorage
    StorageService.clearAuth();
    
    return result;
  }

  // Inscription
  static async signUp(email: string, password: string, username?: string) {
    return signUp(email, password, username);
  }

  // Réinitialisation de mot de passe
  static async resetPassword(email: string) {
    return resetPassword(email);
  }

  // Vérifier et restaurer la session depuis localStorage
  static async restoreSession(): Promise<{ user: User; token: string } | null> {
    try {
      // Vérifier s'il y a des données en localStorage
      const stored = StorageService.getAuth();
      if (!stored.user || !stored.token) {
        return null;
      }

      // Vérifier si le token est toujours valide avec Supabase
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // Token invalide, nettoyer le localStorage
        StorageService.clearAuth();
        return null;
      }

      // Token valide, mettre à jour les infos utilisateur si nécessaire
      const updatedUser: User = {
        id: currentUser.id,
        email: currentUser.email || stored.user.email,
        username: currentUser.user_metadata?.full_name || 
                 currentUser.user_metadata?.username || 
                 stored.user.username,
        isLoggedIn: true
      };

      // Mettre à jour en localStorage
      StorageService.updateUser(updatedUser);

      return { user: updatedUser, token: stored.token };
    } catch (error) {
      console.error('Erreur lors de la restauration de session:', error);
      StorageService.clearAuth();
      return null;
    }
  }

  // Vérifier si il y a une session stockée
  static hasStoredSession(): boolean {
    return StorageService.hasAuth();
  }
}
