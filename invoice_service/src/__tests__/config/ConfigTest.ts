import Config from '@config/index';

describe('Config', () => {
  let envBackup: NodeJS.ProcessEnv;

  const setEnvVariables = () => {
    process.env.ENV = 'test';
    process.env.PORT = '3000';
    process.env.DB_USER = 'user';
    process.env.DB_HOST = 'localhost';
    process.env.DB_NAME = 'database';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_PORT = '5432';
    process.env.JWT_SECRET = 'secret';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.EFI_BANK_BASE_URL = 'http://localhost:3000';
    process.env.EFI_BANK_CERT_PATH = 'certs/cert.pem';
    process.env.EFI_BANK_CLIENT_ID = 'client_id';
    process.env.EFI_BANK_CLIENT_SECRET = 'client_secret';
    process.env.EFI_BANK_PIX_KEY = 'pix_key';
    process.env.LNBITS_BASE_URL = 'http://localhost:3000';
    process.env.LNBITS_API_KEY = 'api_key';
    process.env.LNBITS_WEBHOOK_PATH = '/webhook';
    process.env.PHOTOS_BUCKET_NAME = 'bucket_name';
    process.env.HOST = 'localhost'
  };

  beforeEach(() => {
    envBackup = { ...process.env };
    setEnvVariables();
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('should initialize config with valid environment variables', () => {
    const config = new Config().getConfig();

    expect(config.env).toBe('test');
    expect(config.port).toBe(3000);
    expect(config.db.user).toBe('user');
    expect(config.db.host).toBe('localhost');
    expect(config.db.database).toBe('database');
    expect(config.db.password).toBe('password');
    expect(config.db.port).toBe(5432);
    expect(config.jwtSecret).toBe('secret');
  });

  it('should throw an error if ENV is not defined', () => {
    delete process.env.NODE_ENV;

    expect(() => new Config()).toThrow('NODE_ENV is not defined');
  });

  it('should throw an error if DB_USER is not defined', () => {
    delete process.env.DB_USER;

    expect(() => new Config()).toThrow('DB_USER is not defined');
  });

  it('should throw an error if DB_HOST is not defined', () => {
    delete process.env.DB_HOST;

    expect(() => new Config()).toThrow('DB_HOST is not defined');
  });

  it('should throw an error if DB_NAME is not defined', () => {
    delete process.env.DB_NAME;

    expect(() => new Config()).toThrow('DB_NAME is not defined');
  });

  it('should throw an error if DB_PASSWORD is not defined', () => {
    delete process.env.DB_PASSWORD;

    expect(() => new Config()).toThrow('DB_PASSWORD is not defined');
  });

  it('should throw an error if DB_PORT is not defined', () => {
    delete process.env.DB_PORT;

    expect(() => new Config()).toThrow('DB_PORT is not defined');
  });

  it('should throw an error if JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;

    expect(() => new Config()).toThrow('JWT_SECRET is not defined');
  });

  it('should throw an error if MONGODB_URI is not defined', () => {
    delete process.env.MONGODB_URI;

    expect(() => new Config()).toThrow('MONGODB_URI is not defined');
  });

  it('should throw an error if PHOTO_BUCKET_NAME is not defined', () => {
    delete process.env.PHOTOS_BUCKET_NAME;

    expect(() => new Config()).toThrow('PHOTOS_BUCKET_NAME is not defined');
  })

  it('should throw an error if HOST is not defined', () => {
    delete process.env.HOST;

    expect(() => new Config()).toThrow('HOST is not defined');
  });
});