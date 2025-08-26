// Aplicação Tilapios - Versão Supabase
console.log('Carregando aplicação Tilapios com Supabase...');

// Importar Supabase
import { supabase, auth, db } from './supabaseConfig.js';

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
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    showAuthMessage('Login realizado com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro no login:', error);
    let errorMessage = 'Erro ao fazer login. Tente novamente.';
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Email ou senha incorretos.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Email não confirmado.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'Email inválido.';
    } else if (error.message.includes('Too many requests')) {
      errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    if (error) throw error;
    
    showAuthMessage('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.', 'success');
    
  } catch (error) {
    console.error('Erro no cadastro:', error);
    let errorMessage = 'Erro ao criar conta. Tente novamente.';
    
    if (error.message.includes('already registered')) {
      errorMessage = 'Este email já está em uso.';
    } else if (error.message.includes('invalid email')) {
      errorMessage = 'Email inválido.';
    } else if (error.message.includes('password')) {
      errorMessage = 'Senha muito fraca.';
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
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    
    if (error) throw error;
    
    showAuthMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    
  } catch (error) {
    console.error('Erro na recuperação:', error);
    let errorMessage = 'Erro ao enviar email de recuperação.';
    
    if (error.message.includes('user not found')) {
      errorMessage = 'Usuário não encontrado.';
    } else if (error.message.includes('invalid email')) {
      errorMessage = 'Email inválido.';
    }
    
    showAuthMessage(errorMessage);
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Inicializar sistema de autenticação
function initAuthSystem() {
  console.log('Inicializando sistema de autenticação com Supabase...');
  
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
function initApp() {
  console.log('Inicializando aplicação com Supabase...');
  
  // Simular carregamento com feedback visual
  setTimeout(() => {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.opacity = '0';
      loading.style.transform = 'scale(0.95)';
      setTimeout(() => {
        loading.style.display = 'none';
        // Mostrar aplicação principal
        const app = document.getElementById('app');
        if (app) {
          app.classList.remove('hidden');
        }
      }, 300);
    }
    
    // Inicializar sistema de autenticação após um pequeno delay
    setTimeout(() => {
      initAuthSystem();
    }, 100);
    
    // Verificar estado de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        currentUser = session.user;
        hideAuthModal();
        loadUserData();
        console.log('Usuário logado:', currentUser.email);
      } else {
        currentUser = null;
        showAuthModal();
        console.log('Usuário não logado');
      }
    });
    
    // Configurar navegação
    setupNavigation();
    
    // Carregar dados
    loadData();
    
    // Mostrar seção inicial (ranking)
    showSection('ranking');
    
    // Mostrar notificação de boas-vindas
    setTimeout(() => {
      showNotification('🎣 Bem-vindo ao Tilapios! Explore suas estatísticas de pesca.', 'success', 5000);
    }, 500);
    
    console.log('Aplicação inicializada!');
  }, 1000);
}

// Função para fazer logout
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    showNotification('Logout realizado com sucesso!', 'success');
    currentUser = null;
    showAuthModal();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    showNotification('Erro ao fazer logout. Tente novamente.', 'error');
  }
}

// Adicionar botão de logout
function addLogoutButton() {
  const userMenu = document.getElementById('user-menu');
  if (userMenu) {
    userMenu.addEventListener('click', function(e) {
      if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
        e.preventDefault();
        handleLogout();
      }
    });
  }
}

// Carregar dados do usuário
async function loadUserData() {
  if (!currentUser) return;
  
  try {
    // Atualizar UI com informações do usuário
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = currentUser.user_metadata?.name || currentUser.email;
    }
    
    // Carregar capturas do usuário
    await loadUserCaptures();
    
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    showNotification('Erro ao carregar seus dados. Tente novamente.', 'error');
  }
}

// Carregar capturas do usuário
async function loadUserCaptures() {
  if (!currentUser) return;
  
  try {
    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    userCapturesData = data || [];
    updateCapturesUI();
    
  } catch (error) {
    console.error('Erro ao carregar capturas:', error);
    showNotification('Erro ao carregar suas capturas. Tente novamente.', 'error');
  }
}

// Adicionar nova captura
async function addCapture(captureData) {
  if (!currentUser) {
    showNotification('Você precisa estar logado para registrar capturas.', 'error');
    return;
  }
  
  try {
    // Adicionar ID do usuário aos dados da captura
    captureData.user_id = currentUser.id;
    captureData.user_name = currentUser.user_metadata?.name || currentUser.email;
    
    const { data, error } = await supabase
      .from('captures')
      .insert([captureData])
      .select();
    
    if (error) throw error;
    
    // Atualizar dados locais
    userCapturesData.unshift(data[0]);
    updateCapturesUI();
    
    // Atualizar ranking
    loadRankingData();
    
    showNotification('Captura registrada com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao adicionar captura:', error);
    showNotification('Erro ao registrar captura. Tente novamente.', 'error');
  }
}

// Excluir captura
async function deleteCapture(captureId) {
  if (!currentUser) return;
  
  try {
    const { error } = await supabase
      .from('captures')
      .delete()
      .eq('id', captureId)
      .eq('user_id', currentUser.id); // Garantir que o usuário só exclua suas próprias capturas
    
    if (error) throw error;
    
    // Atualizar dados locais
    userCapturesData = userCapturesData.filter(capture => capture.id !== captureId);
    updateCapturesUI();
    
    // Atualizar ranking
    loadRankingData();
    
    showNotification('Captura excluída com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao excluir captura:', error);
    showNotification('Erro ao excluir captura. Tente novamente.', 'error');
  }
}

// Carregar dados do ranking
async function loadRankingData() {
  try {
    // Obter todas as capturas para calcular o ranking
    const { data, error } = await supabase
      .from('captures')
      .select('*');
    
    if (error) throw error;
    
    // Processar dados para o ranking
    const captures = data || [];
    processRankingData(captures);
    
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    showNotification('Erro ao carregar ranking. Tente novamente.', 'error');
  }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);