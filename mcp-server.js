#!/usr/bin/env node

/**
 * MCP Server para Firebase - Projeto Tilapios
 * Este servidor implementa o Model Context Protocol para integração com Firebase
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Importações do Firebase Admin SDK
const admin = require('firebase-admin');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase Admin
let firebaseApp;

try {
  // Inicializar Firebase Admin com credenciais padrão ou service account
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'pescador-79e00'
    });
  } else {
    // Para desenvolvimento local, usar emulador ou credenciais de teste
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'pescador-79e00'
    });
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin:', error.message);
}

class FirebaseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'firebase-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  setupToolHandlers() {
    // Handler para listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'firebase_deploy',
            description: 'Deploy para Firebase Hosting',
            inputSchema: {
              type: 'object',
              properties: {
                target: {
                  type: 'string',
                  description: 'Target do deploy (hosting, functions, etc.)',
                  default: 'hosting'
                },
                message: {
                  type: 'string',
                  description: 'Mensagem do deploy (opcional)'
                }
              }
            }
          },
          {
            name: 'firestore_query',
            description: 'Consultar dados no Firestore',
            inputSchema: {
              type: 'object',
              properties: {
                collection: {
                  type: 'string',
                  description: 'Nome da coleção'
                },
                limit: {
                  type: 'number',
                  description: 'Limite de documentos',
                  default: 10
                },
                orderBy: {
                  type: 'string',
                  description: 'Campo para ordenação'
                }
              },
              required: ['collection']
            }
          },
          {
            name: 'auth_list_users',
            description: 'Listar usuários do Firebase Auth',
            inputSchema: {
              type: 'object',
              properties: {
                maxResults: {
                  type: 'number',
                  description: 'Número máximo de usuários',
                  default: 10
                }
              }
            }
          },
          {
            name: 'firebase_status',
            description: 'Verificar status do projeto Firebase',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    // Handler para executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'firebase_deploy':
            return await this.handleFirebaseDeploy(args);
          
          case 'firestore_query':
            return await this.handleFirestoreQuery(args);
          
          case 'auth_list_users':
            return await this.handleAuthListUsers(args);
          
          case 'firebase_status':
            return await this.handleFirebaseStatus(args);
          
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro ao executar ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  setupResourceHandlers() {
    // Implementar handlers de recursos se necessário
  }

  async handleFirebaseDeploy(args) {
    const target = args.target || 'hosting';
    const message = args.message || 'Deploy via MCP';

    try {
      const command = `firebase deploy --only ${target}`;
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: process.cwd()
      });

      return {
        content: [
          {
            type: 'text',
            text: `✅ Deploy realizado com sucesso!\n\nComando: ${command}\n\nSaída:\n${output}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Falha no deploy: ${error.message}`);
    }
  }

  async handleFirestoreQuery(args) {
    if (!firebaseApp) {
      throw new Error('Firebase não inicializado');
    }

    const { collection, limit = 10, orderBy } = args;
    const db = admin.firestore();

    try {
      let query = db.collection(collection);
      
      if (orderBy) {
        query = query.orderBy(orderBy, 'desc');
      }
      
      query = query.limit(limit);
      
      const snapshot = await query.get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          data: doc.data()
        });
      });

      return {
        content: [
          {
            type: 'text',
            text: `📊 Consulta na coleção '${collection}':\n\n${JSON.stringify(documents, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Erro na consulta Firestore: ${error.message}`);
    }
  }

  async handleAuthListUsers(args) {
    if (!firebaseApp) {
      throw new Error('Firebase não inicializado');
    }

    const { maxResults = 10 } = args;

    try {
      const listUsersResult = await admin.auth().listUsers(maxResults);
      const users = listUsersResult.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      }));

      return {
        content: [
          {
            type: 'text',
            text: `👥 Usuários Firebase Auth (${users.length}/${listUsersResult.users.length}):\n\n${JSON.stringify(users, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`);
    }
  }

  async handleFirebaseStatus(args) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'pescador-79e00';
      const configExists = fs.existsSync('./firebase.json');
      const firebaseRcExists = fs.existsSync('./.firebaserc');
      
      let firebaseConfig = null;
      if (configExists) {
        firebaseConfig = JSON.parse(fs.readFileSync('./firebase.json', 'utf8'));
      }

      const status = {
        projectId,
        configExists,
        firebaseRcExists,
        firebaseInitialized: !!firebaseApp,
        config: firebaseConfig,
        timestamp: new Date().toISOString()
      };

      return {
        content: [
          {
            type: 'text',
            text: `🔥 Status do Firebase:\n\n${JSON.stringify(status, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Erro ao verificar status: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🔥 Firebase MCP Server iniciado');
  }
}

// Iniciar servidor
const server = new FirebaseMCPServer();
server.run().catch(console.error);

// Tratamento de sinais
process.on('SIGINT', async () => {
  console.error('\n🛑 Encerrando Firebase MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\n🛑 Encerrando Firebase MCP Server...');
  process.exit(0);
});