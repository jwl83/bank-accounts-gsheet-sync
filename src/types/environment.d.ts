declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BANK_ACCOUNT_DATA_SECRET_ID: string;
      BANK_ACCOUNT_DATA_SECRET_KEY: string;
      BANK_ACCOUNT_DATA_COUNTRY: string;
      GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
      GOOGLE_PRIVATE_KEY: string;
      GOOGLE_SHEET_ID: string;
    }
  }
}

export {};
