import {
  initBankAccountData,
  deleteRequisition,
} from '../services/bank-account-data';
import { getCliArgs } from '../services/cli';

// Take required arguments from CLI
const [requisitionId] = getCliArgs(
  1,
  'Error: Link ID must be provided as an argument when running this command!',
);

// Init bank-account-data client
const client = await initBankAccountData();

// Delete requisition (link)
await deleteRequisition(client, requisitionId);

// Output information
console.log('Link delete completed!');
