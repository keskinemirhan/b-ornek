import * as Joi  from "joi";

export const envSchema = Joi.object({
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().port().required(),
  SMTP_TLS: Joi.boolean().default(false),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  CONSOLE_MAIL: Joi.boolean().default(false),
  MAIL_SENDER: Joi.string().email().required(),
  APP_HOST: Joi.string().ip().required(),
  APP_PORT: Joi.number().port().required(),
  APP_URL: Joi.string().uri().required(),
});
