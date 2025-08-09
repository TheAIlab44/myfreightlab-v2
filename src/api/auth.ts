import { supabase } from './services/supabaseService';
import type { LoginRequest, LoginResponse } from '../types/api';

// API d'authentification
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        message: getErrorMessage(error.message)
      };
    }

    if (data.user && data.session) {
      return {
        success: true,
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata?.full_name || 
                   data.user.user_metadata?.username || 
                   data.user.email?.split('@')[0] || 'Utilisateur'
        }
      };
    }

    return {
      success: false,
      message: 'Erreur lors de la connexion'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur'
    };
  }
};

// API d'inscription
export const signUp = async (email: string, password: string, username?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          full_name: username || email.split('@')[0]
        }
      }
    });

    if (error) {
      return {
        success: false,
        message: getErrorMessage(error.message)
      };
    }

    return {
      success: true,
      user: data.user,
      message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'
    };
  } catch (error) {
    console.error('SignUp error:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'inscription'
    };
  }
};

// API de déconnexion
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
};

// API de réinitialisation de mot de passe
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      return {
        success: false,
        message: getErrorMessage(error.message)
      };
    }

    return {
      success: true,
      message: 'Email de réinitialisation envoyé !'
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email'
    };
  }
};

// Helper pour transformer les messages d'erreur en français
const getErrorMessage = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
    'User not found': 'Utilisateur non trouvé',
    'Invalid email': 'Format d\'email invalide',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'User already registered': 'Un compte existe déjà avec cet email',
    'Signup requires a valid password': 'Mot de passe requis pour l\'inscription',
    'Unable to validate email address': 'Impossible de valider l\'adresse email',
    'Email address is invalid': 'Adresse email invalide',
    'Password is too weak': 'Le mot de passe est trop faible'
  };

  return errorMap[errorMessage] || errorMessage;
};
