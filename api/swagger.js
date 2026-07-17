import dotenv from "dotenv";
dotenv.config();

import swaggerJsDoc from "swagger-jsdoc";

const serverUrl =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT || 3000}`
    : process.env.SERVER;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Management API",
      version: "1.0.0",
      description: "API documentation for Employee Management System",
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;