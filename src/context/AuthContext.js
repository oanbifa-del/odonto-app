// Contexto de autenticação usando Firebase REST API.
// Compatível com Expo e React Native.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FIREBASE_AUTH_URL, API_KEY } from '../services/firebaseConfig';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

// 🔐 Bypass temporário do login para desenvolvimento.
// Defina como false quando o Firebase Authentication estiver configurado.
const BYPASS_AUTH = false;

// Traduz erros comuns do Firebase para mensagens mais claras.
function mapAuthError(message = '') {
  const code = message.replace('auth/', '').trim();
  const dictionary = {
    CONFIGURATION_NOT_FOUND:
      'Ative o login por e-mail e senha no Firebase Authentication (Sign-in method).',
    EMAIL_EXISTS: 'Este e-mail já está cadastrado.',
    INVALID_PASSWORD: 'Senha inválida.',
    EMAIL_NOT_FOUND: 'E-mail não encontrado.',
    USER_DISABLED: 'Usuário desabilitado.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Muitas tentativas. Tente novamente mais tarde.'
  };

  return dictionary[code] || dictionary[message] || 'Não foi possível autenticar. Verifique os dados.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [idToken, setIdToken] = useState(null);

  // Carrega token salvo ao iniciar
  useEffect(() => {
    if (BYPASS_AUTH) {
      setUser({ uid: 'dev-bypass', email: 'dev@local' });
      setIdToken('dev-bypass');
      setInitializing(false);
      return;
    }

    const loadStoredToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('firebaseToken');
        const refreshToken = await SecureStore.getItemAsync('firebaseRefreshToken');
        const email = await SecureStore.getItemAsync('userEmail');

        if (refreshToken && email) {
          const refreshResponse = await fetch(
            `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `grant_type=refresh_token&refresh_token=${refreshToken}`
            }
          );
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok && refreshData.id_token) {
            await SecureStore.setItemAsync('firebaseToken', refreshData.id_token);
            await SecureStore.setItemAsync('firebaseRefreshToken', refreshData.refresh_token);
            setUser({ uid: email, email });
            setIdToken(refreshData.id_token);
            setInitializing(false);
            return;
          }
        }

        if (token && email) {
          setUser({ uid: email, email });
          setIdToken(token);
        }
      } catch (error) {
        console.error('Erro ao carregar token armazenado:', error);
      } finally {
        setInitializing(false);
      }
    };

    loadStoredToken();
  }, []);

  const signUp = async (email, password) => {
    try {
      const response = await fetch(
        `${FIREBASE_AUTH_URL}:signUp?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(mapAuthError(data.error?.message || 'Erro ao criar conta'));
      }

      // Armazena token seguramente
      await SecureStore.setItemAsync('firebaseToken', data.idToken);
      await SecureStore.setItemAsync('firebaseRefreshToken', data.refreshToken);
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userId', data.localId);

      setUser({ uid: data.localId, email });
      setIdToken(data.idToken);
      
      return { uid: data.localId, email };
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(
        `${FIREBASE_AUTH_URL}:signInWithPassword?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(mapAuthError(data.error?.message || 'Email ou senha inválidos'));
      }

      // Armazena token seguramente
      await SecureStore.setItemAsync('firebaseToken', data.idToken);
      await SecureStore.setItemAsync('firebaseRefreshToken', data.refreshToken);
      await SecureStore.setItemAsync('userEmail', email);
      await SecureStore.setItemAsync('userId', data.localId);

      setUser({ uid: data.localId, email });
      setIdToken(data.idToken);
      
      return { uid: data.localId, email };
    } catch (error) {
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await SecureStore.deleteItemAsync('firebaseToken');
      await SecureStore.deleteItemAsync('firebaseRefreshToken');
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userId');
      
      setUser(null);
      setIdToken(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      idToken,
      signIn,
      signUp,
      signOutUser
    }),
    [user, initializing, idToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider.');
  }
  return context;
}
