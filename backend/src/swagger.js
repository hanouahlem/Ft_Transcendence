import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ft_transcendence Public API",
      version: "1.0.0",
      description:
        "Public REST API for ft_transcendence. All endpoints require an API key via the `x-api-key` header.",
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
      schemas: {
        Post: {
          type: "object",
          properties: {
            id: { type: "integer" },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            author: {
              type: "object",
              properties: {
                id: { type: "integer" },
                username: { type: "string" },
                displayName: { type: "string", nullable: true },
                avatar: { type: "string", nullable: true },
              },
            },
            likesCount: { type: "integer" },
            commentsCount: { type: "integer" },
            media: { type: "string", nullable: true },
          },
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
  apis: [path.join(__dirname, "routes/publicApi.routes.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
