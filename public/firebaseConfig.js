// Importar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// INSTRUÇÕES PARA OBTER AS CREDENCIAIS CORRETAS:
// 1. Acesse: https://console.firebase.google.com/project/pescador-79e00/settings/general
// 2. Role até "Seus apps" e clique no ícone da web (</>) 
// 3. Copie as credenciais reais e substitua os valores abaixo

export const firebaseConfig = {
  apiKey: "AIzaSyBeOBlFS3jbh0uM3t0T71LQnv14J9yRLWI",
  authDomain: "pescador-79e00.firebaseapp.com",
  projectId: "pescador-79e00", 
  storageBucket: "pescador-79e00.firebasestorage.app",
  messagingSenderId: "238257791759",
  appId: "1:238257791759:web:4d747d717551ff8df7947a",
  measurementId: "G-HY619219E7"
};

// IMPORTANTE: Para obter a API key correta:
// 1. Acesse o Console do Firebase (https://console.firebase.google.com/)
// 2. Selecione seu projeto 'pescador-79e00'
// 3. Vá em Configurações do Projeto > Geral
// 4. Na seção 'Seus apps', encontre o app Web
// 5. Clique em 'Config' para ver as credenciais corretas
// 6. Substitua a apiKey acima pela apiKey real do seu projeto

// Configuração atualizada com as credenciais reais do Firebase

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

// Exportar app para uso em outros módulos
export default app;