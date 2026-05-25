// Contexto global para gerenciar pacientes, procedimentos e agendamentos.
// Agora usa o Firestore via REST API (compatível com Expo).
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FIRESTORE_URL, API_KEY } from '../services/firebaseConfig';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

const toFirestoreValue = value => {
  if (value === null) return { nullValue: null };
  if (typeof value === 'number') return { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value) };
};

const toFirestoreFields = data =>
  Object.entries(data).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[key] = toFirestoreValue(value);
    return acc;
  }, {});

const fromFirestoreValue = value => {
  if (value?.stringValue !== undefined) return value.stringValue;
  if (value?.doubleValue !== undefined) return Number(value.doubleValue);
  if (value?.integerValue !== undefined) return Number(value.integerValue);
  if (value?.booleanValue !== undefined) return Boolean(value.booleanValue);
  if (value?.timestampValue !== undefined) return value.timestampValue;
  return null;
};

const parseDocument = doc => {
  const fields = doc.fields || {};
  const data = Object.keys(fields).reduce((acc, key) => {
    acc[key] = fromFirestoreValue(fields[key]);
    return acc;
  }, {});
  return { id: doc.name.split('/').pop(), ...data };
};

const buildHeaders = idToken => ({
  Authorization: `Bearer ${idToken}`,
  'Content-Type': 'application/json'
});

const fetchCollection = async (collection, idToken) => {
  const response = await fetch(`${FIRESTORE_URL}/${collection}?key=${API_KEY}`, {
    headers: buildHeaders(idToken)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Erro ao carregar dados.');
  }
  const data = await response.json();
  return data.documents ? data.documents.map(parseDocument) : [];
};

const createDocument = async (collection, payload, idToken) => {
  const response = await fetch(`${FIRESTORE_URL}/${collection}?key=${API_KEY}`, {
    method: 'POST',
    headers: buildHeaders(idToken),
    body: JSON.stringify({ fields: toFirestoreFields(payload) })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Erro ao salvar registro.');
  }
  const data = await response.json();
  const id = data.name.split('/').pop();
  return { id, ...payload };
};

const updateDocument = async (collection, id, payload, idToken) => {
  const fields = toFirestoreFields(payload);
  const mask = Object.keys(fields)
    .map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join('&');
  const response = await fetch(`${FIRESTORE_URL}/${collection}/${id}?key=${API_KEY}&${mask}`, {
    method: 'PATCH',
    headers: buildHeaders(idToken),
    body: JSON.stringify({ fields })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Erro ao atualizar registro.');
  }
};

const deleteDocument = async (collection, id, idToken) => {
  const response = await fetch(`${FIRESTORE_URL}/${collection}/${id}?key=${API_KEY}`, {
    method: 'DELETE',
    headers: buildHeaders(idToken)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Erro ao remover registro.');
  }
};

export function AppDataProvider({ children }) {
  const { idToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!idToken) {
        setLoading(false);
        setError('Usuário não autenticado.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [patientsData, proceduresData, appointmentsData] = await Promise.all([
          fetchCollection('patients', idToken),
          fetchCollection('procedures', idToken),
          fetchCollection('appointments', idToken)
        ]);

        setPatients(
          [...patientsData].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        );
        setProcedures(
          [...proceduresData].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        );
        setAppointments(
          [...appointmentsData]
            .map(item => ({ status: 'scheduled', ...item }))
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        );
      } catch (err) {
        setError(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idToken]);

  const ensureToken = () => {
    if (!idToken) {
      throw new Error('Usuário não autenticado.');
    }
    return idToken;
  };

  const addPatient = async data => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const payload = { ...data, fullName, createdAt: new Date().toISOString() };
    const created = await createDocument('patients', payload, ensureToken());
    setPatients(prev => [created, ...prev]);
    return created;
  };

  const updatePatient = async (id, data) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const payload = { ...data, fullName, updatedAt: new Date().toISOString() };
    await updateDocument('patients', id, payload, ensureToken());
    setPatients(prev => prev.map(item => (item.id === id ? { ...item, ...payload } : item)));
  };

  const removePatient = async id => {
    const related = appointments.filter(item => item.patientId === id);
    await Promise.all([
      deleteDocument('patients', id, ensureToken()),
      ...related.map(item => deleteDocument('appointments', item.id, ensureToken()))
    ]);
    setPatients(prev => prev.filter(item => item.id !== id));
    setAppointments(prev => prev.filter(item => item.patientId !== id));
  };

  const addProcedure = async data => {
    const payload = { ...data, createdAt: new Date().toISOString() };
    const created = await createDocument('procedures', payload, ensureToken());
    setProcedures(prev => [created, ...prev]);
    return created;
  };

  const updateProcedure = async (id, data) => {
    const payload = { ...data, updatedAt: new Date().toISOString() };
    await updateDocument('procedures', id, payload, ensureToken());
    setProcedures(prev => prev.map(item => (item.id === id ? { ...item, ...payload } : item)));
  };

  const removeProcedure = async id => {
    const related = appointments.filter(item => item.procedureId === id);
    await Promise.all([
      deleteDocument('procedures', id, ensureToken()),
      ...related.map(item => deleteDocument('appointments', item.id, ensureToken()))
    ]);
    setProcedures(prev => prev.filter(item => item.id !== id));
    setAppointments(prev => prev.filter(item => item.procedureId !== id));
  };

  const addAppointment = async data => {
    const payload = { status: 'scheduled', ...data, createdAt: new Date().toISOString() };
    const created = await createDocument('appointments', payload, ensureToken());
    setAppointments(prev => [created, ...prev]);
    return created;
  };

  const updateAppointment = async (id, data) => {
    const payload = { ...data, updatedAt: new Date().toISOString() };
    await updateDocument('appointments', id, payload, ensureToken());
    setAppointments(prev => prev.map(item => (item.id === id ? { ...item, ...payload } : item)));
  };

  const cancelAppointment = async id => {
    const payload = { status: 'cancelled', updatedAt: new Date().toISOString() };
    await updateDocument('appointments', id, payload, ensureToken());
    setAppointments(prev => prev.map(item => (item.id === id ? { ...item, ...payload } : item)));
  };

  const value = useMemo(
    () => ({
      patients,
      procedures,
      appointments,
      loading,
      error,
      addPatient,
      updatePatient,
      removePatient,
      addProcedure,
      updateProcedure,
      removeProcedure,
      addAppointment,
      updateAppointment,
      cancelAppointment,
      getPatientById: id => patients.find(patient => patient.id === id),
      getProcedureById: id => procedures.find(procedure => procedure.id === id),
      getAppointmentById: id => appointments.find(appointment => appointment.id === id)
    }),
    [patients, procedures, appointments, loading, error]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
