// Importar Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// INSTRUÇÕES PARA OBTER AS CREDENCIAIS CORRETAS:
// 1. Acesse: https://app.supabase.com/project/_/settings/api
// 2. Copie a URL do projeto e a chave anon/public
// 3. Substitua os valores abaixo

// Configuração do Supabase
export const supabaseConfig = {
  // Credenciais reais do projeto
  supabaseUrl: 'https://xyzcompany.supabase.co', // Substitua pela URL real do seu projeto
  supabaseKey: 'sb_publishable_x8wF6pUtkV6J9Kzpy40jXA_YohyBJcW' // Chave publicável do seu projeto
};

// Inicializar Supabase
const supabase = createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseKey);

// Exportar cliente Supabase para uso em outros módulos
export { supabase };

// Exportar funções de autenticação para manter compatibilidade com código existente
export const auth = {
  // Métodos de autenticação
  signInWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  createUserWithEmailAndPassword: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    return data;
  },
  
  sendPasswordResetEmail: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    });
    
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  onAuthStateChanged: (callback) => {
    // Verificar o estado atual da autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      callback(session?.user || null);
    });
    
    // Configurar listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    
    // Retornar função para desinscrever
    return () => subscription.unsubscribe();
  },
  
  updateProfile: async (user, profile) => {
    const { data, error } = await supabase.auth.updateUser({
      data: profile
    });
    
    if (error) throw error;
    return data;
  },
  
  // Propriedade para acessar o usuário atual
  get currentUser() {
    return supabase.auth.getUser().then(({ data }) => data.user);
  }
}

// Exportar funções de banco de dados para manter compatibilidade com código existente
export const db = {
  // Métodos para manipulação de dados
  collection: (collectionName) => {
    return {
      // Adicionar documento
      addDoc: async (data) => {
        const { data: result, error } = await supabase
          .from(collectionName)
          .insert([data])
          .select();
        
        if (error) throw error;
        return { id: result[0].id, ...result[0] };
      },
      
      // Obter documentos
      getDocs: async () => {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*');
        
        if (error) throw error;
        
        // Formatar resultado para ser compatível com o Firestore
        return {
          docs: data.map(doc => ({
            id: doc.id,
            data: () => ({ ...doc })
          }))
        };
      },
      
      // Consulta
      query: (...args) => {
        // Processar argumentos para construir a consulta
        let query = supabase.from(collectionName).select('*');
        
        // Processar condições where, orderBy, etc.
        for (const arg of args) {
          if (arg._type === 'where') {
            query = query.filter(arg.field, arg.operator, arg.value);
          } else if (arg._type === 'orderBy') {
            query = query.order(arg.field, { ascending: arg.direction === 'asc' });
          }
        }
        
        // Retornar objeto com método getDocs
        return {
          getDocs: async () => {
            const { data, error } = await query;
            
            if (error) throw error;
            
            // Formatar resultado para ser compatível com o Firestore
            return {
              docs: data.map(doc => ({
                id: doc.id,
                data: () => ({ ...doc })
              }))
            };
          }
        };
      },
      
      // Documento específico
      doc: (docId) => {
        return {
          // Obter documento
          get: async () => {
            const { data, error } = await supabase
              .from(collectionName)
              .select('*')
              .eq('id', docId)
              .single();
            
            if (error) throw error;
            
            // Formatar resultado para ser compatível com o Firestore
            return {
              id: data.id,
              exists: !!data,
              data: () => ({ ...data })
            };
          },
          
          // Atualizar documento
          updateDoc: async (updates) => {
            const { data, error } = await supabase
              .from(collectionName)
              .update(updates)
              .eq('id', docId)
              .select();
            
            if (error) throw error;
            return data;
          },
          
          // Excluir documento
          deleteDoc: async () => {
            const { error } = await supabase
              .from(collectionName)
              .delete()
              .eq('id', docId);
            
            if (error) throw error;
          }
        };
      }
    };
  },
  
  // Funções auxiliares para consultas
  where: (field, operator, value) => {
    // Mapear operadores do Firestore para o Supabase
    const operatorMap = {
      '==': 'eq',
      '!=': 'neq',
      '>': 'gt',
      '>=': 'gte',
      '<': 'lt',
      '<=': 'lte',
      'array-contains': 'cs', // contains
      'array-contains-any': 'cs', // contains
      'in': 'in',
      'not-in': 'not.in'
    };
    
    return {
      _type: 'where',
      field,
      operator: operatorMap[operator] || operator,
      value
    };
  },
  
  orderBy: (field, direction = 'asc') => {
    return {
      _type: 'orderBy',
      field,
      direction
    };
  },
  
  // Funções de servidor e timestamp
  serverTimestamp: () => new Date(),
  Timestamp: {
    fromDate: (date) => date,
    now: () => new Date()
  }
}

// Exportar cliente Supabase como padrão
export default supabase;