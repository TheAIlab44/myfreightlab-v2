# Configuration Netlify - Gestion des Secrets

## Problème
Netlify détecte les variables d'environnement `VITE_*` dans le bundle JavaScript compilé et les considère comme des "secrets exposés".

## Pourquoi ce n'est pas un problème de sécurité

### Variables VITE_ sont intentionnellement publiques
- **VITE_SUPABASE_URL** : URL publique de l'API Supabase (doit être accessible côté client)
- **VITE_SUPABASE_ANON_KEY** : Clé anonyme publique Supabase (conçue pour être exposée)
- **VITE_N8N_BASE_URL** : URL de base du webhook n8n (nécessaire côté client)

### Fonctionnement de Vite
Vite injecte automatiquement toutes les variables préfixées par `VITE_` dans le code client. C'est le comportement attendu pour les variables d'environnement côté client.

## Solutions implémentées

### Solution 1 : Ignorer les clés spécifiques
```toml
SECRETS_SCAN_OMIT_KEYS = "VITE_N8N_BASE_URL,VITE_SUPABASE_ANON_KEY,VITE_SUPABASE_URL"
```

### Solution 2 : Désactiver complètement le scan (si nécessaire)
```toml
SECRETS_SCAN_ENABLED = "false"
```

## Sécurité

### Ce qui est sécurisé
- Les clés sont conçues pour être publiques (anon key Supabase)
- Row Level Security (RLS) activé sur Supabase
- Authentification requise pour accéder aux données sensibles

### Ce qui n'est jamais exposé
- Clés privées de Supabase (service_role_key)
- Secrets de tokens JWT
- Credentials serveur n8n

## Références
- [Netlify Secrets Scanning](https://docs.netlify.com/security/secrets-scanning/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Client Keys](https://supabase.com/docs/guides/api/api-keys)
