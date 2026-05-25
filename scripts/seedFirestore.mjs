import { FIREBASE_AUTH_URL, FIRESTORE_URL, API_KEY } from '../src/services/firebaseConfig.js';

const email = process.env.FIREBASE_EMAIL;
const password = process.env.FIREBASE_PASSWORD;

if (!email || !password) {
  console.error('Defina FIREBASE_EMAIL e FIREBASE_PASSWORD para executar o seed.');
  process.exit(1);
}

const toFirestoreValue = value => {
  if (value === null) return { nullValue: null };
  if (typeof value === 'number') return { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  return { stringValue: String(value) };
};

const toFirestoreFields = data =>
  Object.entries(data).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[key] = toFirestoreValue(value);
    return acc;
  }, {});

const formatDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const signIn = async () => {
  const response = await fetch(`${FIREBASE_AUTH_URL}:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Falha ao autenticar.');
  }
  return data.idToken;
};

const createDocument = async (collection, payload, idToken) => {
  const response = await fetch(`${FIRESTORE_URL}/${collection}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: toFirestoreFields(payload) })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erro ao salvar registro.');
  }
  return { id: data.name.split('/').pop(), ...payload };
};

const seed = async () => {
  const idToken = await signIn();
  const now = new Date();

  const procedures = [
    { name: 'Limpeza', description: 'Profilaxia completa', price: 180, durationMinutes: 40 },
    { name: 'Clareamento', description: 'Clareamento em consultório', price: 750, durationMinutes: 60 },
    { name: 'Restauração', description: 'Restauração em resina', price: 320, durationMinutes: 50 },
    { name: 'Canal', description: 'Tratamento endodôntico', price: 980, durationMinutes: 90 }
  ];

  const patients = [
    {
      firstName: 'Ana',
      lastName: 'Souza',
      birthDate: '1996-03-12',
      instagram: '@ana.souza',
      phone: '(11) 98888-1122',
      email: 'ana.souza@email.com',
      address: 'Rua das Flores, 120',
      notes: 'Prefere atendimento pela manhã'
    },
    {
      firstName: 'Carlos',
      lastName: 'Mendes',
      birthDate: '1988-10-03',
      instagram: '@carlos.mendes',
      phone: '(11) 97777-4455',
      email: 'carlos.mendes@email.com',
      address: 'Av. Central, 540',
      notes: 'Retorno a cada 6 meses'
    },
    {
      firstName: 'Beatriz',
      lastName: 'Almeida',
      birthDate: '1992-07-21',
      instagram: '@bia.almeida',
      phone: '(11) 96666-7788',
      email: 'bia.almeida@email.com',
      address: 'Rua do Sol, 88',
      notes: 'Sensibilidade em dentes anteriores'
    },
    {
      firstName: 'Diego',
      lastName: 'Lima',
      birthDate: '1990-12-01',
      instagram: '@diegolima',
      phone: '(11) 95555-3344',
      email: 'diego.lima@email.com',
      address: 'Rua da Serra, 45',
      notes: 'Consulta de rotina'
    }
  ];

  const createdProcedures = [];
  for (const item of procedures) {
    createdProcedures.push(await createDocument('procedures', { ...item, createdAt: now.toISOString() }, idToken));
  }

  const createdPatients = [];
  for (const item of patients) {
    const fullName = `${item.firstName} ${item.lastName}`.trim();
    createdPatients.push(
      await createDocument(
        'patients',
        { ...item, fullName, createdAt: now.toISOString() },
        idToken
      )
    );
  }

  const appointments = [
    {
      patientIndex: 0,
      procedureIndex: 0,
      date: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate())),
      time: '09:30',
      paymentMethod: 'PIX'
    },
    {
      patientIndex: 1,
      procedureIndex: 2,
      date: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
      time: '14:00',
      paymentMethod: 'Cartão'
    },
    {
      patientIndex: 2,
      procedureIndex: 1,
      date: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)),
      time: '11:00',
      paymentMethod: 'Dinheiro'
    },
    {
      patientIndex: 3,
      procedureIndex: 3,
      date: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5)),
      time: '16:30',
      paymentMethod: 'PIX'
    },
    {
      patientIndex: 1,
      procedureIndex: 0,
      date: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4)),
      time: '08:30',
      paymentMethod: 'Cartão',
      status: 'cancelled'
    }
  ];

  for (const item of appointments) {
    const patient = createdPatients[item.patientIndex];
    const procedure = createdProcedures[item.procedureIndex];
    await createDocument(
      'appointments',
      {
        patientId: patient.id,
        procedureId: procedure.id,
        date: item.date,
        time: item.time,
        price: procedure.price,
        paymentMethod: item.paymentMethod,
        status: item.status || 'scheduled',
        createdAt: now.toISOString()
      },
      idToken
    );
  }

  console.log('Seed finalizado com sucesso.');
};

seed().catch(error => {
  console.error('Falha ao gerar dados:', error.message);
  process.exit(1);
});
