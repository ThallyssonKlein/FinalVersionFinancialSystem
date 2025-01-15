import dotenv from "dotenv";

type IConfig = {
  env: string;
  port: number;
  db: {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
  };
  mongodb: {
    uri: string;
  }
  jwtSecret: string;
  efiBankBaseURL: string;
  efiBankCertPath: string;
  efiBankClientId: string;
  efiBankClientSecret: string;
  efiBankPixKey: string;
  lnbitsBaseURL: string;
  lnbitsApiKey: string;
  lnbitsWebhookPath: string;
  websocket: {
    senderPrefix: string;
    receiverPrefix: string;
  },
  photosBucketName: string;
  host: string;
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

      if (!process.env.HOST) {
        throw new Error("HOST is not defined");
      }
    }

    if (!process.env.DB_USER) {
      throw new Error("DB_USER is not defined");
    }

    if (!process.env.DB_HOST) {
      throw new Error("DB_HOST is not defined");
    }

    if (!process.env.DB_NAME) {
      throw new Error("DB_NAME is not defined");
    }

    if (!process.env.DB_PASSWORD) {
      throw new Error("DB_PASSWORD is not defined");
    }

    if (!process.env.DB_PORT) {
      throw new Error("DB_PORT is not defined");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    if (!process.env.EFI_BANK_BASE_URL) {
      throw new Error("EFI_BANK_BASE_URL is not defined");
    }

    if (!process.env.EFI_BANK_CERT_PATH) {
      throw new Error("EFI_BANK_CERT_PATH is not defined");
    }

    if (!process.env.EFI_BANK_CLIENT_ID) {
      throw new Error("EFI_BANK_CLIENT_ID is not defined");
    }

    if (!process.env.EFI_BANK_CLIENT_SECRET) {
      throw new Error("EFI_BANK_CLIENT_SECRET is not defined");
    }

    if (!process.env.EFI_BANK_PIX_KEY) {
      throw new Error("EFI_BANK_PIX_KEY is not defined");
    }

    if (!process.env.LNBITS_BASE_URL) {
      throw new Error("LNBITS_BASE_URL is not defined");
    }

    if (!process.env.LNBITS_API_KEY) {
      throw new Error("LNBITS_API_KEY is not defined");
    }

    if (!process.env.LNBITS_WEBHOOK_PATH) {
      throw new Error("LNBITS_WEBHOOK_PATH is not defined");
    }

    if (!process.env.PHOTOS_BUCKET_NAME) {
      throw new Error("PHOTOS_BUCKET_NAME is not defined");
    }

    this.config = {
      env: process.env.DD_ENV,
      port: parseInt(process.env.PORT || "3000"),
      db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
      },
      mongodb: {
        uri: process.env.MONGODB_URI,
      },
      jwtSecret: process.env.JWT_SECRET,
      efiBankBaseURL: process.env.EFI_BANK_BASE_URL,
      efiBankCertPath: process.env.EFI_BANK_CERT_PATH,
      efiBankClientId: process.env.EFI_BANK_CLIENT_ID,
      efiBankClientSecret: process.env.EFI_BANK_CLIENT_SECRET,
      efiBankPixKey: process.env.EFI_BANK_PIX_KEY,
      lnbitsBaseURL: process.env.LNBITS_BASE_URL,
      lnbitsApiKey: process.env.LNBITS_API_KEY,
      lnbitsWebhookPath: process.env.LNBITS_WEBHOOK_PATH,
      websocket: {
        senderPrefix: 'payment-confirmation-',
        receiverPrefix: 'private-',
      },
      photosBucketName: process.env.PHOTOS_BUCKET_NAME,
      host: process.env.HOST || 'localhost'
    };
  }

  getConfig() {
    return this.config;
  }
}
