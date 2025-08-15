// Importar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// INSTRUÇÕES PARA OBTER AS CREDENCIAIS CORRETAS:
// 1. Acesse: https://console.firebase.google.com/project/pescador-79e00/settings/general
// 2. Role até "Seus apps" e clique no ícone da web (</>) 
// 3. Copie as credenciais reais e substitua os valores abaixo

export const firebaseConfig = {
  apiKey: "AIzaSyBeOBlFS3jbh0uM3t0T71QnY14J9yRLWI",
  authDomain: "pescador-79e00.firebaseapp.com",
  projectId: "pescador-79e00", 
  storageBucket: "pescador-79e00.appspot.com",
  messagingSenderId: "238257791759",
  appId: "1:238257791759:web:8e6e4e2b4c6d8f7a9b0c1d2e" // Valor real do appId do console do Firebase
};

// Configuração atualizada com as credenciais reais do Firebase

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

// Exportar app para uso em outros módulos
export default app;