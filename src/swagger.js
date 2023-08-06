const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Memes',
      version: '1.0.0',
      description: 'Documentação da API de Memes',
    },
    servers: [
      {
        url: 'http://localhost:3333', // Substitua pela URL do seu servidor
      },
    ],
  },
  apis: ['src/index.ts'], // Substitua pelo caminho do seu arquivo principal
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerSpec),
};
