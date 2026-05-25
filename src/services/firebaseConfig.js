// Configuração do Firebase usando REST API
// Compatível com Expo e React Native sem dependências nativas

// Credenciais do projeto Firebase
export const firebaseConfig = {
  apiKey: 'AIzaSyBNvA1E1O3nqvCn-NTeuxDOpuB77lAuzDY',
  authDomain: 'ondontoclinica-2026.firebaseapp.com',
  projectId: 'ondontoclinica-2026',
  storageBucket: 'ondontoclinica-2026.firebasestorage.app',
  messagingSenderId: '1043773847074',
  appId: '1:1043773847074:web:f7a143d260107409b17c7b'
};

// URLs da API REST do Firebase
export const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;
export const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
export const API_KEY = firebaseConfig.apiKey;
