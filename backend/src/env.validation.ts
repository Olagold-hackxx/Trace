import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  DB_HOST: Joi.string().default("localhost"),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow("").required(),
  DB_SYNC: Joi.boolean().truthy("true").falsy("false").default(false),
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow("").optional(),
  JWT_SECRET: Joi.string().required(),
  SQUAD_SECRET_KEY: Joi.string().allow("").optional(),
  SQUAD_PUBLIC_KEY: Joi.string().allow("").optional(),
  SQUAD_WEBHOOK_SECRET: Joi.string().allow("").optional(),
  SQUAD_BASE_URL: Joi.string().uri().default("https://sandbox-api-d.squadco.com"),
  SQUAD_BENEFICIARY_ACCOUNT: Joi.string().allow("").optional(),
  SQUAD_PAYOUT_ACCOUNT_NUMBER: Joi.string().allow("").optional(),
  SQUAD_PAYOUT_BANK_CODE: Joi.string().allow("").optional(),
  SQUAD_MERCHANT_ID: Joi.string().allow("").optional(),
  APP_BASE_URL: Joi.string().uri().default("http://localhost:3001"),
  SQUAD_REDIRECT_URL: Joi.string().uri().default("http://localhost:3001/api/v1/payments/callback"),
  PUBLIC_WEBHOOK_URL: Joi.string().uri().default("http://localhost:3001/webhooks/squad")
});
