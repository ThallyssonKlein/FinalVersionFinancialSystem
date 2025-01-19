import dotenv from "dotenv";

type IConfig = {
  env: string;
  port: number;
  host: string;
  notion: {
    apiKey: string;
    databaseId: string;
  },
  db: {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
  },
  mongodb: {
    uri: string;
  }
  business: {
    defaultConfigId: string;
  },
  rulesEngineAPI: {
    baseURL: string,
  }
};

export default class Config {
  private config: IConfig;

  constructor() {
    const envFile = process.env.NODE_ENV === 'production' ? '.env.production' :
                    process.env.NODE_ENV === 'development-docker' ? '.env.development-docker' :
                    process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';
    dotenv.config({ path: envFile });
    
    if (!process.env.NODE_ENV) {
      throw new Error("NODE_ENV is not defined");
    }

    process.env.DD_ENV = process.env.NODE_ENV;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "development-docker") {
      process.env.DD_SERVICE = "local-template";
    } else {
      process.env.DD_SERVICE = "production-template";
    }

    if (!process.env.HOST) {
        throw new Error("HOST is not defined");
    }

    if (!process.env.PORT) {
        throw new Error("PORT is not defined");
    }

    if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY is not defined");
    }

    if (!process.env.NOTION_DATABASE_ID) {
        throw new Error("NOTION_DATABASE_ID is not defined");
    }

    if (!process.env.DEFAULT_CONFIG_ID) {
      throw new Error("DEFAULT_CONFIG_ID is not defined");
    }

    if (!process.env.DB_USER) {
      throw new Error("DB_USER is not defined");
    }

    if (!process.env.DB_HOST) {
      throw new Error("DB_HOST is not defined");
    }

    if (!process.env.DB_DATABASE) {
      throw new Error("DB_DATABASE is not defined");
    }

    if (!process.env.DB_PASSWORD) {
      throw new Error("DB_PASSWORD is not defined");
    }

    if (!process.env.DB_PORT) {
      throw new Error("DB_PORT is not defined");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    if (!process.env.RULES_ENGINE_URL) {
      throw new Error("RULES_ENGINE_URL is not defined");
    }

    this.config = {
      env: process.env.NODE_ENV,
      host: process.env.HOST,
      port: parseInt(process.env.PORT),
      notion: {
        apiKey: process.env.NOTION_API_KEY,
        databaseId: process.env.NOTION_DATABASE_ID
      },
      business: {
        defaultConfigId: process.env.DEFAULT_CONFIG_ID
      },
      db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT)
      },
      mongodb: {
        uri: process.env.MONGODB_URI
      },
      rulesEngineAPI: {
        baseURL: process.env.RULES_ENGINE_URL,
      }
    };
  }

  getConfig() {
    return this.config;
  }
}
