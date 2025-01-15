import dotenv from "dotenv";

type IConfig = {
  env: string;
  port: number;
  host: string;
  notion: {
    apiKey: string;
    databaseId: string;
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

    this.config = {
      env: process.env.NODE_ENV,
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT || "3000"),
      notion: {
        apiKey: process.env.NOTION_API_KEY || '',
        databaseId: process.env.NOTION_DATABASE_ID || ''
    }
    };
  }

  getConfig() {
    return this.config;
  }
}
