import 'dotenv/config';
import NordigenClient from 'nordigen-node';

export interface Institution {
  id: string;
  name: string;
  bic: string;
  countries: string[];
  logo: string;
  max_access_valid_for_days: string;
  transaction_total_days: string;
}

export type InstitutionsList = Institution[];

export type RequisitionStatus =
  | 'CR' // CREATED - Requisition has been successfully created
  | 'GC' // GIVING_CONSENT - End-user is giving consent at GoCardless's consent screen
  | 'UA' // UNDERGOING_AUTHENTICATION - End-user is redirected to the financial institution for authentication
  | 'RJ' // REJECTED - Either SSN verification has failed or end-user has entered incorrect credentials
  | 'SA' // SELECTING_ACCOUNTS - End-user is selecting accounts
  | 'GA' // GRANTING_ACCESS - End-user is granting access to their account information
  | 'LN' // LINKED - Account has been successfully linked to requisition
  | 'EX'; // EXPIRED - Access to accounts has expired as set in End User Agreement

export interface Requisition {
  id: string;
  created: string;
  redirect: string;
  status: RequisitionStatus;
  institution_id: string;
  agreement: string;
  reference: string;
  accounts: string[];
  user_language: string;
  link: string;
  ssn: null | string;
  account_selection: boolean;
  redirect_immediate: boolean;
}

export interface RequisitionsList {
  results: Requisition[];
}

export interface RequisitionRequest {
  redirectUrl: string;
  institutionId: string;
  agreement?: string;
  userLanguage?: string;
  reference: string;
  ssn: string;
  redirectImmediate: boolean;
  accountSelection: boolean;
}

export interface AccountBalances {
  balanceAmount: {
    amount: string;
    currency: string;
  };
  balanceType: 'expected' | 'interimAvailable';
  referenceDate: string;
}

export interface AccountBalancesResult {
  balances: AccountBalances[];
}

export interface ApiError {
  response: {
    data: {
      summary: string;
      detail: string;
      status_code: number;
    };
  };
}

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  typeof (error as Record<string, unknown>).response === 'object';
const isApiRateLimitError = (err: ApiError): boolean =>
  err.response.data.status_code === 429;

export const GOCARDLESS_BASE_URL = 'https://gocardless.com/';

export const initBankAccountData = async () => {
  // Initiate bank-account-data client with secretId/secretKey from bankaccountdata.gocardless.com
  const client = new NordigenClient({
    secretId: process.env.BANK_ACCOUNT_DATA_SECRET_ID,
    secretKey: process.env.BANK_ACCOUNT_DATA_SECRET_KEY,
    baseUrl: 'https://bankaccountdata.gocardless.com/api/v2',
  });

  // Generate bank-account-data access token
  await client.generateToken();

  return client;
};

export const getInstitutions = async (client: NordigenClient) =>
  (await client.institution.getInstitutions({
    country: process.env.BANK_ACCOUNT_DATA_COUNTRY,
  })) as InstitutionsList;

export const getRequisitions = async (client: NordigenClient) =>
  (await client.requisition.getRequisitions()) as RequisitionsList;

export const getRequisitionById = async (client: NordigenClient, id: string) =>
  (await client.requisition.getRequisitionById(id)) as Requisition;

export const createRequisition = async (
  client: NordigenClient,
  data: RequisitionRequest,
) => (await client.requisition.createRequisition(data)) as Requisition;

export const deleteRequisition = async (client: NordigenClient, id: string) =>
  (await client.requisition.deleteRequisition(id)) as void;

export const getAccountBalances = async (
  client: NordigenClient,
  accountId: string,
) => {
  const account = client.account(accountId);
  try {
    return (await account.getBalances()) as AccountBalancesResult;
  } catch (err) {
    if (!isApiError(err)) {
      console.error('Unknown error occurred');
      console.error(err);
    } else if (isApiRateLimitError(err)) {
      console.error('Rate limit error occurred');
      console.error(err.response.data.detail);
    } else {
      console.error('API error occurred');
      console.error(err.response.data);
    }
    return null;
  }
};
