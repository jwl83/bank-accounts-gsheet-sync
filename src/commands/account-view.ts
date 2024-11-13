import {
  initBankAccountData,
  getRequisitionById,
  getAccountBalances,
} from '../services/bank-account-data';
import { getCliArgs } from '../services/cli';

// Take required arguments from CLI
const [requisitionId] = getCliArgs(
  1,
  'Error: Link ID must be provided as an argument when running this command!',
);

// Init bank-account-data client
const client = await initBankAccountData();

// Get requisition (link) data based on requisition (link) ID
const requisition = await getRequisitionById(client, requisitionId);

// Log reference & id
const { id, reference } = requisition;
console.log(`reference: ${reference}`);
console.log(`id: ${id}`);

// Validate status is "LN" (successfully linked)
if (requisition.status !== 'LN') {
  console.warn(`Skipping link - invalid status of "${requisition.status}"`);
  process.exit(1);
}

// Get first account in requisition
const accountId = requisition.accounts[0];

// Fetch account balances
const balances = await getAccountBalances(client, accountId);

// Validate balance has been retrieved correctly
if (!balances) {
  console.warn('Skipping link - error retrieving account balance');
  process.exit(1);
}

// Get first item in balances result
const balance = balances.balances[0];

// Log referenceDate (for reference only)
console.log(`referenceDate: ${balance.referenceDate}`);

// Format balance amount
const balanceAmount =
  Math.round(
    (parseFloat(balance.balanceAmount.amount) + Number.EPSILON) * 100,
  ) / 100;
console.log(`balanceAmount: ${balanceAmount}`);
