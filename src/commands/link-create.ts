import {
  initBankAccountData,
  createRequisition,
  GOCARDLESS_BASE_URL,
} from '../services/bank-account-data';
import { getCliArgs } from '../services/cli';

// Take required arguments from CLI
const [institutionId, reference] = getCliArgs(
  2,
  'Error: Bank ID & Reference must be provided as arguments when running this command!',
);

// Init bank-account-data client
const client = await initBankAccountData();

// Initialise new requisition (link)
const data = {
  institutionId,
  reference,
  redirectUrl: GOCARDLESS_BASE_URL,
  ssn: '',
  redirectImmediate: false,
  accountSelection: false,
};

const requisition = await createRequisition(client, data);

// Output information
console.log(
  'Authorise with your bank via the link below to gain access to account data...',
);
console.log(requisition.link);
