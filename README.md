# Odonto App

Aplicativo mobile para gestao de clinicas odontologicas, com pacientes, procedimentos, agenda, autenticacao e painel financeiro. O app usa Expo SDK 54, React Native e Firebase via REST API.

## Funcionalidades

- Login e cadastro com e-mail e senha
- Cadastro e edicao de pacientes
- Cadastro e edicao de procedimentos
- Agenda com visualizacoes por dia, semana e mes
- Criacao, edicao, cancelamento e remarcacao de consultas
- Busca de pacientes por nome ou telefone
- Painel financeiro com filtros por mes, indicadores e ranking de procedimentos
- Campos de data e horario com seletores nativos, sem abrir teclado numerico junto
- Ajustes de teclado nos formularios para evitar campos cobertos durante a digitacao

## Tecnologias

- Expo SDK 54
- React Native 0.81
- React 19
- React Navigation
- Firebase Authentication e Firestore via REST API
- EAS Build para gerar APK Android

## Estrutura

```text
src/
  components/   Componentes reutilizaveis
  context/      Contextos de autenticacao e dados
  navigation/   Navegacao principal e abas
  screens/      Telas do aplicativo
  services/     Configuracoes e integracoes
  styles/       Cores e tokens visuais
```

## Requisitos

- Node.js 20+
- npm
- Conta Expo/EAS configurada
- Firebase Authentication com Email/Password habilitado
- Firestore configurado conforme `FIREBASE_SETUP.md`

## Instalacao

```bash
npm install
```

## Rodando em desenvolvimento

```bash
npm start
```

Se o Expo Go apresentar erro de carregamento ou update remoto, rode com cache limpo:

```bash
npm run start:clear
```

Se o celular nao estiver na mesma rede ou nao conseguir acessar o Metro local:

```bash
npm run start:tunnel
```

## Scripts

```bash
npm start          # Inicia o Expo
npm run start:clear   # Inicia o Expo limpando cache
npm run start:tunnel  # Inicia via tunnel com cache limpo
npm run android    # Abre no Android
npm run ios        # Abre no iOS
npm run web        # Abre no navegador
npm run build:apk  # Gera APK Android pelo EAS profile preview
npm run build:android # Gera build Android de producao
```

## Build APK

O projeto tem `eas.json` configurado com profile `preview` para gerar APK Android:

```bash
npm run build:apk
```

O APK standalone usa o bundle embarcado, com updates remotos desabilitados em `app.json`. Isso evita falhas como `Failed to Download remote update` ao abrir o app instalado.

## Validacoes usadas antes da build

```bash
npx expo-doctor
npx expo install --check
npx expo export --platform android --output-dir .expo-export-test --clear
```

## Firebase

As credenciais e URLs ficam em `src/services/firebaseConfig.js`. O app usa Firebase via REST API para manter compatibilidade com Expo e evitar dependencias nativas extras.

Para configurar o projeto Firebase, siga o arquivo:

```text
FIREBASE_SETUP.md
```

## Solucao de problemas

Se o app nao abrir no APK:

1. Rode `npx expo-doctor`
2. Confirme se `expo-font` e `react-native-worklets` estao instalados
3. Gere o bundle local com `npx expo export --platform android --clear`
4. Gere um novo APK com `npm run build:apk`

Se o login ou sincronizacao falhar:

1. Confirme se Email/Password esta ativo no Firebase Authentication
2. Verifique as regras do Firestore
3. Confirme se o usuario esta autenticado
4. Revise `FIREBASE_SETUP.md`
