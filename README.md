# Odonto App

Aplicativo de gestão para clínicas odontológicas com cadastro de pacientes, procedimentos, agenda e painel financeiro. O projeto usa Expo (SDK 54) e integra com Firebase via REST API para funcionar no Expo Go.

## ✨ Funcionalidades

- Autenticação por e-mail e senha
- Cadastro de pacientes com dados completos
- Cadastro e edição de procedimentos
- Agenda com visualização por dia/semana/mês
- Busca por nome ou telefone
- Painel financeiro com indicadores e filtros por mês

## 🧱 Tecnologias

- Expo SDK 54
- React Native 0.81
- Firebase Auth + Firestore (REST API)
- React Navigation

## 📁 Estrutura do projeto

```
src/
  components/   # Componentes reutilizáveis
  context/      # Contextos globais (Auth e Dados)
  navigation/   # Navegação
  screens/      # Telas do app
  services/     # Configurações e integrações
```

## ✅ Pré-requisitos

- Node.js 18+
- npm 9+
- Expo Go instalado no celular

## 🚀 Instalação

```bash
npm install
```

## 🔧 Configuração do Firebase

Confira o passo a passo completo em **FIREBASE_SETUP.md**.  
É necessário habilitar **Email/Password** no Firebase Authentication.

## ▶️ Rodando o app

```bash
npm start
```

Abra o Expo Go no celular e escaneie o QR Code.

## 📌 Scripts úteis

```bash
npm start        # Inicia o Expo
npm run android  # Abre no Android
npm run ios      # Abre no iOS
npm run web      # Abre no navegador
```

## 🩺 Solução de problemas

**Erro de sincronização**:

1. Verifique se está logado no app
2. Confirme se o método Email/Password está ativo no Firebase
3. Revise as Firestore Rules em FIREBASE_SETUP.md
4. Limpe o cache com `expo start -c`

---

Se precisar personalizar cores, textos ou branding, ajuste os arquivos em `src/styles/` e `src/components/`.
