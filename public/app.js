// Aplicação Tilapios - Versão Simplificada
console.log('Carregando aplicação Tilapios...');

// Importar Firebase
import { auth, db } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Estado global da aplicação
let currentUser = null;
let userCapturesData = [];

// Manipular login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  try {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    await signInWithEmailAndPassword(auth, email, password);
    showAuthMessage('Login realizado com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro no login:', error);
    let errorMessage = 'Erro ao fazer login. Tente novamente.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Usuário não encontrado.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Senha incorreta.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        break;
    }
    
    showAuthMessage(errorMessage);
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Manipular cadastro
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  // Validações
  if (password !== confirmPassword) {
    showAuthMessage('As senhas não coincidem.');
    return;
  }
  
  if (password.length < 6) {
    showAuthMessage('A senha deve ter pelo menos 6 caracteres.');
    return;
  }
  
  try {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar perfil com o nome
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    showAuthMessage('Conta criada com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro no cadastro:', error);
    let errorMessage = 'Erro ao criar conta. Tente novamente.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Este email já está em uso.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Senha muito fraca.';
        break;
    }
    
    showAuthMessage(errorMessage);
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Manipular recuperação de senha
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('forgot-email').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  try {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    await sendPasswordResetEmail(auth, email);
    showAuthMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    
  } catch (error) {
    console.error('Erro na recuperação:', error);
    let errorMessage = 'Erro ao enviar email de recuperação.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Usuário não encontrado.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido.';
        break;
    }
    
    showAuthMessage(errorMessage);
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Adicionar botão de logout
function addLogoutButton() {
  const header = document.querySelector('header .flex.items-center.justify-between');
  if (header && !document.getElementById('logout-btn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'hidden bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i>Sair';
    logoutBtn.addEventListener('click', handleLogout);
    header.appendChild(logoutBtn);
  }
}

// Manipular logout
async function handleLogout() {
  try {
    await signOut(auth);
    console.log('Logout realizado com sucesso');
  } catch (error) {
    console.error('Erro no logout:', error);
  }
}

// Carregar dados do usuário
async function loadUserData() {
  if (!currentUser) return;
  
  try {
    // Mostrar botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
    }
    
    // Carregar capturas do Firestore
    const capturesQuery = query(
      collection(db, 'captures'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(capturesQuery);
    userCapturesData = [];
    
    querySnapshot.forEach((doc) => {
      userCapturesData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Atualizar interface
    updateCapturesDisplay();
    updateStatistics();
    updateRankingDisplay();
    
    console.log(`Carregadas ${userCapturesData.length} capturas do usuário`);
    
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
}

// Inicializar sistema de autenticação
function initAuthSystem() {
  console.log('Inicializando sistema de autenticação...');
  
  // Verificar se o modal existe
  const authModal = document.getElementById('auth-modal');
  console.log('Modal de autenticação encontrado:', !!authModal);
  
  // Verificar se os botões existem
  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');
  const showForgotBtn = document.getElementById('show-forgot-password');
  const backToLoginBtn = document.getElementById('back-to-login');
  
  console.log('Botões encontrados:', {
    'show-register': !!showRegisterBtn,
    'show-login': !!showLoginBtn,
    'show-forgot-password': !!showForgotBtn,
    'back-to-login': !!backToLoginBtn
  });
  
  // Event listeners para navegação entre formulários usando delegação de eventos
  document.addEventListener('click', function(e) {
    console.log('Clique detectado em:', e.target.id, e.target.tagName);
    
    if (e.target.id === 'show-register') {
      e.preventDefault();
      console.log('Navegando para formulário de cadastro');
      showRegisterForm();
    } else if (e.target.id === 'show-login') {
      e.preventDefault();
      console.log('Navegando para formulário de login');
      showLoginForm();
    } else if (e.target.id === 'show-forgot-password') {
      e.preventDefault();
      console.log('Navegando para formulário de recuperação de senha');
      showForgotPasswordForm();
    } else if (e.target.id === 'back-to-login') {
      e.preventDefault();
      console.log('Voltando para formulário de login');
      showLoginForm();
    } else if (e.target.id === 'editProfileBtn') {
      e.preventDefault();
      openEditProfileModal();
    } else if (e.target.id === 'changePhotoBtn') {
      e.preventDefault();
      changeProfilePhoto();
    } else if (e.target.id === 'closeEditProfileModal') {
      e.preventDefault();
      closeEditProfileModal();
    } else if (e.target.id === 'saveProfileBtn') {
      e.preventDefault();
      saveProfileChanges();
    }
  });
  
  // Event listeners para submissão de formulários
  document.addEventListener('submit', function(e) {
    if (e.target.id === 'login-form-element') {
      e.preventDefault();
      handleLogin(e);
    } else if (e.target.id === 'register-form-element') {
      e.preventDefault();
      handleRegister(e);
    } else if (e.target.id === 'forgot-password-form-element') {
      e.preventDefault();
      handleForgotPassword(e);
    }
  });
  
  console.log('Sistema de autenticação inicializado com delegação de eventos');
  
  // Adicionar botão de logout
  addLogoutButton();
}

// Mostrar modal de autenticação
function showAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.classList.add('show');
    showLoginForm();
    console.log('Modal de autenticação exibido');
  } else {
    console.error('Modal de autenticação não encontrado!');
  }
}

// Esconder modal de autenticação
function hideAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.classList.remove('show');
    console.log('Modal de autenticação ocultado');
  }
}

// Navegação entre formulários
function showLoginForm() {
  hideAllAuthForms();
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.classList.remove('hidden');
  }
  clearAuthMessages();
}

function showRegisterForm() {
  hideAllAuthForms();
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.classList.remove('hidden');
  }
  clearAuthMessages();
}

function showForgotPasswordForm() {
  hideAllAuthForms();
  const forgotForm = document.getElementById('forgot-password-form');
  if (forgotForm) {
    forgotForm.classList.remove('hidden');
  }
  clearAuthMessages();
}

function hideAllAuthForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotForm = document.getElementById('forgot-password-form');
  
  if (loginForm) loginForm.classList.add('hidden');
  if (registerForm) registerForm.classList.add('hidden');
  if (forgotForm) forgotForm.classList.add('hidden');
}

// Limpar mensagens de erro/sucesso
function clearAuthMessages() {
  const messages = document.querySelectorAll('.auth-message');
  messages.forEach(msg => msg.remove());
}

// Mostrar mensagem de erro ou sucesso
function showAuthMessage(message, type = 'error') {
  clearAuthMessages();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `auth-message ${type}`;
  messageDiv.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} mr-2"></i>
    ${message}
  `;
  
  const activeForm = document.querySelector('.auth-form:not(.hidden)');
  if (activeForm) {
    activeForm.insertBefore(messageDiv, activeForm.firstChild);
  }
}

// Aguardar o DOM estar pronto
// Função para forçar logout e limpar sessão
async function forceLogout() {
  try {
    await signOut(auth);
    currentUser = null;
    console.log('Usuário deslogado com sucesso');
  } catch (error) {
    console.log('Erro ao fazer logout:', error);
  }
}

function initApp() {
  console.log('Inicializando aplicação...');
  
  // Forçar logout para garantir que o usuário faça login
  forceLogout();
  
  // Simular carregamento com feedback visual
  setTimeout(() => {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.opacity = '0';
      loading.style.transform = 'scale(0.95)';
      setTimeout(() => {
        loading.style.display = 'none';
        // Não mostrar aplicação principal ainda - aguardar autenticação
      }, 300);
    }
    
    // Inicializar sistema de autenticação após um pequeno delay
    setTimeout(() => {
      initAuthSystem();
    }, 100);
    
    // Verificar estado de autenticação
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        hideAuthModal();
        showMainApp();
        loadUserData();
        console.log('Usuário logado:', user.email);
        
        // Mostrar notificação de boas-vindas apenas para usuários logados
        setTimeout(() => {
          showNotification(`🎣 Bem-vindo ao Tilapios, ${user.displayName || user.email}!`, 'success', 5000);
        }, 500);
      } else {
        currentUser = null;
        hideMainApp();
        showAuthModal();
        console.log('Usuário não logado');
      }
    });
    
    console.log('Aplicação inicializada!');
  }, 1000);
}

// Função para mostrar a aplicação principal (apenas para usuários autenticados)
function showMainApp() {
  const app = document.getElementById('app');
  if (app) {
    app.classList.remove('hidden');
  }
  
  // Configurar navegação
  setupNavigation();
  
  // Carregar dados
  loadData();
  
  // Mostrar seção inicial (ranking)
  showSection('ranking');
}

// Função para esconder a aplicação principal
function hideMainApp() {
  const app = document.getElementById('app');
  if (app) {
    app.classList.add('hidden');
  }
}

// Configurar navegação
function setupNavigation() {
  const buttons = document.querySelectorAll('[data-section]');
  
  buttons.forEach(button => {
    if (button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        showSection(section);
        
        // Fechar menu mobile se estiver aberto
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          toggleMobileMenu();
        }
      });
    }
  });
  
  // Configurar menu hambúrguer mobile
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Botões de ação - Nova Captura
  const btn1 = document.getElementById('btn-add-catch');
  if (btn1) {
    btn1.addEventListener('click', openCaptureModal);
  }
  
  const btn2 = document.getElementById('btn-add-catch-2');
  if (btn2) {
    btn2.addEventListener('click', openCaptureModal);
  }
  
  // Modal de captura
  const captureModal = document.getElementById('capture-modal');
  const closeCaptureModal = document.getElementById('close-capture-modal');
  const cancelCapture = document.getElementById('cancel-capture');
  const captureForm = document.getElementById('capture-form');
  
  if (closeCaptureModal) {
    closeCaptureModal.addEventListener('click', closeCaptureModalHandler);
  }
  
  if (cancelCapture) {
    cancelCapture.addEventListener('click', closeCaptureModalHandler);
  }
  
  if (captureForm) {
    captureForm.addEventListener('submit', handleCaptureSubmit);
  }
  
  // Fechar modal ao clicar fora
  if (captureModal) {
    captureModal.addEventListener('click', function(e) {
      if (e.target === captureModal) {
        closeCaptureModalHandler();
      }
    });
  }
}

// Mostrar seção com transição suave
function showSection(sectionName) {
  // Esconder todas as seções com fade out
  const sections = document.querySelectorAll('[id$="Section"]');
  sections.forEach(section => {
    if (section && !section.classList.contains('hidden')) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(10px)';
      setTimeout(() => {
        section.classList.add('hidden');
        section.style.opacity = '';
        section.style.transform = '';
      }, 150);
    }
  });
  
  // Mostrar seção selecionada com fade in
  setTimeout(() => {
    const target = document.getElementById(sectionName + 'Section');
    if (target) {
      target.classList.remove('hidden');
      target.style.opacity = '0';
      target.style.transform = 'translateY(10px)';
      target.style.transition = 'all 0.3s ease-out';
      
      requestAnimationFrame(() => {
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      });
      
      setTimeout(() => {
        target.style.transition = '';
      }, 300);
    }
  }, 150);
  
  // Atualizar navegação
  const navButtons = document.querySelectorAll('[data-section]');
  navButtons.forEach(btn => {
    if (btn) {
      btn.classList.remove('active');
      if (btn.getAttribute('data-section') === sectionName) {
        btn.classList.add('active');
      }
    }
  });
}

// Carregar dados
function loadData() {
  loadRanking();
  loadCatches();
  loadAchievements();
  loadProfile();
}

// Carregar ranking
async function loadRanking() {
  try {
    const allCaptures = await getAllCaptures();
    const ranking = generateRanking(allCaptures);
    displayRanking(ranking);
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    showNotification('Erro ao carregar ranking', 'error');
  }
}

// Obter todas as capturas para o ranking
async function getAllCaptures() {
  try {
    const capturesQuery = query(
      collection(db, 'captures'),
      orderBy('weight', 'desc')
    );
    const capturesSnapshot = await getDocs(capturesQuery);
    return capturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao obter capturas:', error);
    return [];
  }
}

// Gerar ranking baseado nas capturas
function generateRanking(captures) {
  if (!captures || captures.length === 0) return [];
  
  // Agrupar por usuário e encontrar a maior captura de cada um
  const userBestCatches = {};
  
  captures.forEach(capture => {
    const userId = capture.userId;
    const weight = parseFloat(capture.weight) || 0;
    
    if (!userBestCatches[userId] || weight > userBestCatches[userId].weight) {
      userBestCatches[userId] = {
        userId,
        userName: capture.userName || 'Pescador',
        weight,
        species: capture.species,
        location: capture.location,
        date: capture.date
      };
    }
  });
  
  // Converter para array e ordenar por peso
  return Object.values(userBestCatches)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10); // Top 10
}

// Exibir ranking
function displayRanking(ranking) {
  const container = document.getElementById('rankingList');
  if (!container) return;
  
  if (!ranking || ranking.length === 0) {
    container.innerHTML = '<p class="no-data">Nenhuma captura registrada ainda. Seja o primeiro!</p>';
    return;
  }
  
  const rankingHTML = ranking.map((entry, index) => {
    const position = index + 1;
    const isWinner = position === 1;
    const date = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
    
    return `
      <div class="ranking-item ${isWinner ? 'winner' : ''}">
        <div class="rank">${position}</div>
        <div class="info">
          <h3>${entry.userName}</h3>
          <p>${entry.weight}kg - ${entry.species}</p>
          <small>${entry.location} - ${date.toLocaleDateString('pt-BR')}</small>
        </div>
        ${isWinner ? '<div class="crown">👑</div>' : ''}
      </div>
    `;
  }).join('');
  
  container.innerHTML = rankingHTML;
}

// Carregar capturas
async function loadCatches() {
  if (!currentUser) return;
  
  try {
    const userCapturesData = await getUserCaptures(currentUser.uid);
    displayCatchesList(userCapturesData);
  } catch (error) {
    console.error('Erro ao carregar capturas:', error);
    showNotification('Erro ao carregar capturas', 'error');
  }
}

// Exibir lista de capturas
function displayCatchesList(captures) {
  const container = document.getElementById('catchesList');
  if (!container) return;
  
  if (!captures || captures.length === 0) {
    container.innerHTML = '<p class="no-data">Nenhuma captura registrada ainda. Que tal adicionar sua primeira pescaria?</p>';
    return;
  }
  
  const capturesHTML = captures.map(capture => {
    const date = capture.date?.toDate ? capture.date.toDate() : new Date(capture.date);
    return `
      <div class="catch-item">
        <div class="catch-info">
          <h3>${capture.species}</h3>
          <p>${capture.weight}kg</p>
          <small>${capture.location} - ${date.toLocaleDateString('pt-BR')}</small>
          ${capture.notes ? `<p class="catch-notes">${capture.notes}</p>` : ''}
        </div>
        <div class="catch-actions">
          <button onclick="deleteCaptureConfirm('${capture.id}')" class="delete-btn">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = capturesHTML;
}

// Confirmar exclusão de captura
function deleteCaptureConfirm(captureId) {
  if (confirm('Tem certeza que deseja excluir esta captura?')) {
    deleteCapture(captureId);
  }
}

// Excluir captura
async function deleteCapture(captureId) {
  try {
    await deleteCaptureFromFirestore(captureId);
    showNotification('Captura excluída com sucesso!', 'success');
    loadCatches(); // Recarregar lista
    loadProfile(); // Atualizar estatísticas do perfil
  } catch (error) {
    console.error('Erro ao excluir captura:', error);
    showNotification('Erro ao excluir captura', 'error');
  }
}

// Carregar conquistas
function loadAchievements() {
  const container = document.getElementById('achievementsList');
  if (container) {
    container.innerHTML = `
      <div class="achievement-item unlocked">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-info">
          <h3>Primeira Captura</h3>
          <p>Capturou seu primeiro peixe</p>
        </div>
      </div>
      <div class="achievement-item locked">
        <div class="achievement-icon">🔒</div>
        <div class="achievement-info">
          <h3>Explorador</h3>
          <p>Pescou em 3 locais diferentes</p>
        </div>
      </div>
    `;
  }
}

// Carregar perfil
async function loadProfile() {
  if (!currentUser) return;
  
  try {
    // Carregar dados do usuário
    const userProfile = await getUserProfile(currentUser.uid);
    const userCapturesData = await getUserCaptures(currentUser.uid);
    
    // Calcular estatísticas
    const stats = calculateUserStats(userCapturesData);
    
    // Atualizar interface do perfil
    updateProfileHeader(userProfile);
    updateProfileStats(stats);
    updateProfileHistory(userCapturesData);
    
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showNotification('Erro ao carregar dados do perfil', 'error');
  }
}

// Obter perfil do usuário
async function getUserProfile(userId) {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
    if (!userDoc.empty) {
      return userDoc.docs[0].data();
    } else {
      // Criar perfil padrão se não existir
      const defaultProfile = {
        uid: userId,
        displayName: currentUser.displayName || 'Pescador',
        email: currentUser.email,
        photoURL: currentUser.photoURL || '',
        createdAt: new Date(),
        nickname: currentUser.displayName || 'Pescador'
      };
      await addDoc(collection(db, 'users'), defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return null;
  }
}

// Obter capturas do usuário
async function getUserCaptures(userId) {
  try {
    const capturesQuery = query(
      collection(db, 'captures'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const capturesSnapshot = await getDocs(capturesQuery);
    return capturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao obter capturas:', error);
    return [];
  }
}

// Calcular estatísticas do usuário
function calculateUserStats(captures) {
  if (!captures || captures.length === 0) {
    return {
      totalCaptures: 0,
      totalWeight: 0,
      biggestFish: { weight: 0, species: '' },
      fishingDays: 0,
      averageWeight: 0
    };
  }
  
  const totalCaptures = captures.length;
  const totalWeight = captures.reduce((sum, capture) => sum + (parseFloat(capture.weight) || 0), 0);
  
  // Encontrar maior peixe
  const biggestFish = captures.reduce((biggest, capture) => {
    const weight = parseFloat(capture.weight) || 0;
    return weight > biggest.weight ? { weight, species: capture.species } : biggest;
  }, { weight: 0, species: '' });
  
  // Calcular dias únicos de pesca
  const uniqueDates = new Set(captures.map(capture => {
    const date = capture.date?.toDate ? capture.date.toDate() : new Date(capture.date);
    return date.toDateString();
  }));
  const fishingDays = uniqueDates.size;
  
  const averageWeight = totalCaptures > 0 ? totalWeight / totalCaptures : 0;
  
  return {
    totalCaptures,
    totalWeight,
    biggestFish,
    fishingDays,
    averageWeight
  };
}

// Atualizar cabeçalho do perfil
function updateProfileHeader(userProfile) {
  const profilePhoto = document.getElementById('profilePhoto');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  
  if (profilePhoto) {
    profilePhoto.src = userProfile?.photoURL || 'https://via.placeholder.com/80x80?text=👤';
  }
  
  if (profileName) {
    profileName.textContent = userProfile?.nickname || userProfile?.displayName || 'Pescador';
  }
  
  if (profileEmail) {
    profileEmail.textContent = userProfile?.email || currentUser?.email || '';
  }
}

// Atualizar estatísticas do perfil
function updateProfileStats(stats) {
  const elements = {
    totalCaptures: document.getElementById('totalCaptures'),
    totalWeight: document.getElementById('totalWeight'),
    fishingDays: document.getElementById('fishingDays'),
    biggestFish: document.getElementById('biggestFish'),
    averageWeight: document.getElementById('averageWeight')
  };
  
  if (elements.totalCaptures) {
    elements.totalCaptures.textContent = stats.totalCaptures;
  }
  
  if (elements.totalWeight) {
    elements.totalWeight.textContent = `${stats.totalWeight.toFixed(1)}kg`;
  }
  
  if (elements.fishingDays) {
    elements.fishingDays.textContent = stats.fishingDays;
  }
  
  if (elements.biggestFish) {
    elements.biggestFish.textContent = stats.biggestFish.weight > 0 
      ? `${stats.biggestFish.weight.toFixed(1)}kg (${stats.biggestFish.species})`
      : 'Nenhum';
  }
  
  if (elements.averageWeight) {
    elements.averageWeight.textContent = `${stats.averageWeight.toFixed(1)}kg`;
  }
}

// Atualizar histórico do perfil
function updateProfileHistory(captures) {
  const historyContainer = document.getElementById('profileHistory');
  if (!historyContainer) return;
  
  if (!captures || captures.length === 0) {
    historyContainer.innerHTML = '<p class="no-data">Nenhuma captura registrada ainda.</p>';
    return;
  }
  
  const historyHTML = captures.slice(0, 10).map(capture => {
    const date = capture.date?.toDate ? capture.date.toDate() : new Date(capture.date);
    return `
      <div class="history-item">
        <div class="history-date">${date.toLocaleDateString('pt-BR')}</div>
        <div class="history-details">
          <strong>${capture.species}</strong> - ${capture.weight}kg
          <br><small>${capture.location}</small>
        </div>
      </div>
    `;
  }).join('');
  
  historyContainer.innerHTML = historyHTML;
}

// Abrir modal de edição de perfil
function openEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal && currentUser) {
    // Preencher campos com dados atuais
    const nicknameInput = document.getElementById('editNickname');
    const emailInput = document.getElementById('editEmail');
    
    if (nicknameInput) {
      nicknameInput.value = currentUser.displayName || '';
    }
    
    if (emailInput) {
      emailInput.value = currentUser.email || '';
    }
    
    modal.style.display = 'block';
  }
}

// Fechar modal de edição de perfil
function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'none';
    // Limpar campos de senha
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (newPasswordInput) newPasswordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
  }
}

// Salvar alterações do perfil
async function saveProfileChanges() {
  if (!currentUser) return;
  
  try {
    const nickname = document.getElementById('editNickname')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    // Validar senha se fornecida
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
      }
    }
    
    // Atualizar perfil no Firebase Auth
    if (nickname && nickname !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: nickname });
    }
    
    // Atualizar perfil no Firestore
    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
      await updateDoc(userDocRef, {
        nickname: nickname,
        displayName: nickname,
        updatedAt: new Date()
      });
    }
    
    closeEditProfileModal();
    showNotification('Perfil atualizado com sucesso!', 'success');
    loadProfile(); // Recarregar perfil
    
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    showNotification('Erro ao atualizar perfil', 'error');
  }
}

// Alterar foto de perfil
function changeProfilePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = handlePhotoUpload;
  input.click();
}

// Processar upload de foto
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentUser) return;
  
  try {
    // Converter para base64 para armazenamento simples
    const reader = new FileReader();
    reader.onload = async function(e) {
      const photoURL = e.target.result;
      
      // Atualizar no Firebase Auth
      await updateProfile(currentUser, { photoURL });
      
      // Atualizar no Firestore
      const userQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
        await updateDoc(userDocRef, {
          photoURL: photoURL,
          updatedAt: new Date()
        });
      }
      
      showNotification('Foto atualizada com sucesso!', 'success');
      loadProfile(); // Recarregar perfil
    };
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    showNotification('Erro ao atualizar foto', 'error');
  }
}

// Sistema de notificações
function showNotification(message, type = 'info', duration = 4000) {
  // Remover notificação existente se houver
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Adicionar ao DOM
  document.body.appendChild(notification);
  
  // Animar entrada
  requestAnimationFrame(() => {
    notification.classList.add('notification-show');
  });
  
  // Auto remover após duração especificada
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.remove('notification-show');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, duration);
}

// Funções do Modal de Captura
function openCaptureModal() {
  const modal = document.getElementById('capture-modal');
  const form = document.getElementById('capture-form');
  
  if (modal && form) {
    // Definir data e hora atuais
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    document.getElementById('capture-date').value = today;
    document.getElementById('capture-time').value = currentTime;
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Focar no primeiro campo
    setTimeout(() => {
      document.getElementById('fish-species').focus();
    }, 100);
  }
}

function closeCaptureModalHandler() {
  const modal = document.getElementById('capture-modal');
  const form = document.getElementById('capture-form');
  
  if (modal && form) {
    modal.classList.add('hidden');
    form.reset();
  }
}

async function handleCaptureSubmit(e) {
  e.preventDefault();
  
  // Verificar se usuário está logado
  if (!currentUser) {
    showNotification('❌ Você precisa estar logado para salvar capturas.', 'error');
    return;
  }
  
  // Coletar dados do formulário
  const formData = {
    species: document.getElementById('fish-species').value,
    weight: parseFloat(document.getElementById('fish-weight').value),
    length: parseInt(document.getElementById('fish-length').value),
    location: document.getElementById('capture-location').value,
    date: document.getElementById('capture-date').value,
    time: document.getElementById('capture-time').value,
    bait: document.getElementById('bait-used').value,
    notes: document.getElementById('capture-notes').value
  };
  
  // Validar dados
  if (!validateCaptureData(formData)) {
    return;
  }
  
  try {
    // Mostrar loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Salvar no Firestore
    const captureId = await saveCaptureToFirestore(formData);
    
    // Adicionar à lista local
    userCapturesData.unshift({
      id: captureId,
      ...formData,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName || currentUser.email,
      timestamp: new Date()
    });
    
    // Mostrar sucesso
    showNotification('🎣 Captura salva com sucesso!', 'success');
    
    // Fechar modal
    closeCaptureModalHandler();
    
    // Atualizar interface
    updateCapturesDisplay();
    updateStatistics();
    updateRankingDisplay();
    
  } catch (error) {
    console.error('Erro ao salvar captura:', error);
    showNotification('❌ Erro ao salvar captura. Tente novamente.', 'error');
  } finally {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function validateCaptureData(data) {
  if (!data.species) {
    showNotification('❌ Por favor, selecione a espécie do peixe.', 'error');
    return false;
  }
  
  if (!data.weight || data.weight <= 0) {
    showNotification('❌ Por favor, informe um peso válido.', 'error');
    return false;
  }
  
  if (!data.length || data.length <= 0) {
    showNotification('❌ Por favor, informe um comprimento válido.', 'error');
    return false;
  }
  
  if (!data.location.trim()) {
    showNotification('❌ Por favor, informe o local da captura.', 'error');
    return false;
  }
  
  if (!data.date) {
    showNotification('❌ Por favor, informe a data da captura.', 'error');
    return false;
  }
  
  if (!data.time) {
    showNotification('❌ Por favor, informe o horário da captura.', 'error');
    return false;
  }
  
  if (!data.bait) {
    showNotification('❌ Por favor, selecione a isca utilizada.', 'error');
    return false;
  }
  
  return true;
}

function saveCaptureToStorage(captureData) {
  try {
    // Obter capturas existentes
    const existingCaptures = JSON.parse(localStorage.getItem('fishingCaptures') || '[]');
    
    // Adicionar nova captura
    existingCaptures.push(captureData);
    
    // Salvar no localStorage
    localStorage.setItem('fishingCaptures', JSON.stringify(existingCaptures));
    
    console.log('Captura salva:', captureData);
  } catch (error) {
    console.error('Erro ao salvar captura:', error);
    showNotification('❌ Erro ao salvar captura. Tente novamente.', 'error');
  }
}

function loadCapturesFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('fishingCaptures') || '[]');
  } catch (error) {
    console.error('Erro ao carregar capturas:', error);
    return [];
  }
}

function updateCapturesDisplay() {
  // Usar dados do usuário logado
  const captures = userCapturesData;
  
  // Atualizar lista de capturas na interface
  displayCapturesList(captures);
  
  // Atualizar estatísticas
  updateStatistics(captures);
  
  // Atualizar ranking se necessário
  updateRankingDisplay(captures);
}

// Exibir lista de capturas com opção de exclusão
function displayCapturesList(captures) {
  // Encontrar ou criar seção de histórico
  let historySection = document.getElementById('captures-history');
  if (!historySection) {
    // Criar seção de histórico se não existir
    const mainContent = document.querySelector('main');
    if (mainContent) {
      historySection = document.createElement('section');
      historySection.id = 'captures-history';
      historySection.className = 'bg-white rounded-xl shadow-lg p-6 mb-6';
      historySection.innerHTML = `
        <h3 class="text-xl font-bold text-gray-900 mb-4">
          <i class="fas fa-history mr-2 text-blue-600"></i>
          Histórico de Capturas
        </h3>
        <div id="captures-list" class="space-y-3"></div>
      `;
      mainContent.appendChild(historySection);
    }
  }
  
  const capturesList = document.getElementById('captures-list');
  if (!capturesList) return;
  
  if (captures.length === 0) {
    capturesList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-fish text-4xl mb-4 opacity-50"></i>
        <p>Nenhuma captura registrada ainda.</p>
        <p class="text-sm">Clique em "Nova Captura" para começar!</p>
      </div>
    `;
    return;
  }
  
  capturesList.innerHTML = captures.map(capture => `
    <div class="capture-item bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-lg font-semibold text-gray-900">${capture.species}</span>
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              ${capture.weight}kg
            </span>
            ${capture.length ? `<span class="text-gray-600 text-sm">${capture.length}cm</span>` : ''}
          </div>
          
          <div class="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
            <div><i class="fas fa-map-marker-alt mr-1"></i> ${capture.location}</div>
            <div><i class="fas fa-calendar mr-1"></i> ${capture.date}</div>
            ${capture.time ? `<div><i class="fas fa-clock mr-1"></i> ${capture.time}</div>` : ''}
            ${capture.bait ? `<div><i class="fas fa-bug mr-1"></i> ${capture.bait}</div>` : ''}
          </div>
          
          ${capture.notes ? `<p class="text-sm text-gray-700 italic">${capture.notes}</p>` : ''}
        </div>
        
        <button 
          onclick="confirmDeleteCapture('${capture.id}')"
          class="ml-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
          title="Excluir captura"
        >
          <i class="fas fa-trash text-sm"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Confirmar exclusão de captura
function confirmDeleteCapture(captureId) {
  if (confirm('Tem certeza que deseja excluir esta captura? Esta ação não pode ser desfeita.')) {
    deleteCapture(captureId);
  }
}



function updateStatistics(captures) {
  const totalCaptures = captures.length;
  const totalWeight = captures.reduce((sum, capture) => sum + capture.weight, 0);
  const averageWeight = totalCaptures > 0 ? (totalWeight / totalCaptures).toFixed(1) : 0;
  
  // Encontrar maior peixe
  const biggestFish = captures.reduce((max, capture) => 
    capture.weight > (max?.weight || 0) ? capture : max, null);
  
  console.log('Estatísticas atualizadas:', {
    total: totalCaptures,
    pesoTotal: totalWeight,
    pesoMedio: averageWeight,
    maiorPeixe: biggestFish
  });
}

function updateRankingDisplay(captures) {
  // Agrupar capturas por pescador (simulado)
  const rankings = captures.reduce((acc, capture) => {
    const fisherman = 'Você'; // Por enquanto, apenas um usuário
    if (!acc[fisherman]) {
      acc[fisherman] = {
        name: fisherman,
        totalWeight: 0,
        totalCatches: 0,
        biggestFish: 0
      };
    }

// ===== SISTEMA DE AUTENTICAÇÃO =====

// Salvar captura no Firestore
async function saveCaptureToFirestore(captureData) {
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }
  
  try {
    const docRef = await addDoc(collection(db, 'captures'), {
      ...captureData,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName || currentUser.email,
      timestamp: new Date()
    });
    
    console.log('Captura salva com ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Erro ao salvar captura:', error);
    throw error;
  }
}

// Excluir captura
async function deleteCaptureFromFirestore(captureId) {
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }
  
  try {
    await deleteDoc(doc(db, 'captures', captureId));
    console.log('Captura excluída:', captureId);
    
    // Remover da lista local
    userCapturesData = userCapturesData.filter(capture => capture.id !== captureId);
    
    // Atualizar interface
    updateCapturesDisplay();
    updateStatistics();
    updateRankingDisplay();
    
  } catch (error) {
    console.error('Erro ao excluir captura:', error);
    throw error;
  }
}
    
    acc[fisherman].totalWeight += capture.weight;
    acc[fisherman].totalCatches += 1;
    if (capture.weight > acc[fisherman].biggestFish) {
      acc[fisherman].biggestFish = capture.weight;
    }
    
    return acc;
  }, {});
  
  console.log('Ranking atualizado:', rankings);
}

// Função para alternar menu mobile
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBtn = document.getElementById('mobile-menu-btn');
  
  if (mobileMenu && menuBtn) {
    const isHidden = mobileMenu.classList.contains('hidden');
    
    if (isHidden) {
      mobileMenu.classList.remove('hidden');
      menuBtn.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      mobileMenu.classList.add('hidden');
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}