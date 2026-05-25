import { Alert } from 'react-native';

export const showConfirmation = (title, message, onConfirm, destructive = false) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: destructive ? 'Remover' : 'Confirmar',
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm
      }
    ]
  );
};

export const showSuccessAlert = (title, message = '') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

export const showErrorAlert = (title = 'Erro', message = 'Ocorreu um erro inesperado') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};
