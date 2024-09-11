import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  //PORT: number;
  DATABASE_URL: string;
  CRON_EXPRESSION_DELETE_REPORTES: string;
  PATH_REPO_REPORTES: string;
}

const envsSchema = joi
  .object({
   // PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    PATH_REPO_REPORTES: joi.string().required(),
    CRON_EXPRESSION_DELETE_REPORTES: joi.string().required()
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error('Erro aaal iniciar las variables de entonro' + error);
}

const envVars: EnvVars = value;

export const envs = {
 // port: envVars.PORT,
  databaseurl: envVars.DATABASE_URL,
  cron_expression_delete_reportes: envVars.CRON_EXPRESSION_DELETE_REPORTES,
  path_repo_reportes: envVars.PATH_REPO_REPORTES

};