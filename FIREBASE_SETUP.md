# Configuração do Firebase para React Native/Expo

## ℹ️ Informações do Projeto

- **Projeto Firebase**: ondontoclinica-2026
- **ID do Projeto**: ondontoclinica-2026
- **URL de Armazenamento**: ondontoclinica-2026.firebasestorage.app

## 🔧 O que foi mudado

O app usa **Firebase REST API** (Auth + Firestore), que é compatível com Expo Go e não exige módulos nativos.

### Pacotes instalados:

```json
"expo-secure-store": "~15.0.8"
```

## 🚀 Para Expo Go (desenvolvimento)

O Firebase Auth e Firestore funcionam sem configuração nativa adicional no Expo Go.

```bash
npm start
# Scan com Expo Go no celular
```

## ✅ Authentication (Login)

Ative o método **Email/Password** no Firebase Console:
`Authentication → Sign-in method → Email/Password → Enable → Save`.

## 📚 Estrutura de Dados no Firebase

### Collections criadas automaticamente:

- **patients**: Pacientes cadastrados
- **procedures**: Procedimentos disponíveis
- **appointments**: Agendamentos

### Exemplo de documento (patients):

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-05-15",
  "instagram": "@joao.silva",
  "fullName": "João Silva",
  "createdAt": "2026-05-24T17:30:00Z"
}
```

## 🔐 Firestore Security Rules

Adicione estas regras no Firebase Console > Firestore > Regras:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem acessar
    match /patients/{doc=**} {
      allow read, write: if request.auth != null;
    }
    match /procedures/{doc=**} {
      allow read, write: if request.auth != null;
    }
    match /appointments/{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ❓ Troubleshooting

Se receber erros de "permission-denied":

1. Verifique se está logado no app
2. Verifique as Firestore Security Rules acima
3. Verifique se a autenticação está funcionando em LoginScreen

Se o Expo Go conectar mas Firebase não funcionar:

1. Reinstale com `npm install`
2. Limpe cache: `expo start -c`
3. Rescan o código QR

## 📖 Documentação

- Firebase Auth REST API: https://firebase.google.com/docs/reference/rest/auth
- Firestore REST API: https://firebase.google.com/docs/firestore/use-rest-api
- Expo + Firebase: https://docs.expo.dev/guides/using-firebase/
