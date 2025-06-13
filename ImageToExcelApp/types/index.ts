export interface User {
  id: number;
  name: string;
  email: string;
  // ... autres propriétés utilisateur
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// Nouveau type pour les réponses d'API génériques
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status?: string; // Ajouté si votre API Laravel renvoie un statut comme 'success'/'error'
  // ... autres champs communs à vos réponses API
}