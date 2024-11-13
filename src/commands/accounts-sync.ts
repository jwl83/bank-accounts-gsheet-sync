import {
  initBankAccountData,
  getRequisitions,
  getAccountBalances,
} from '../services/bank-account-data';
import {
  initGoogleSheet,
  selectSheet,
  addRowUnique,
  RowData,
} from 'src/services/google-sheet';
import { getCurrentDate } from 'src/services/date';

// Configuration for "Balances" sheet
const BALANCES_SHEET_TITLE = 'Balances';

const BALANCES_SHEET_KEY = 'Date';

// Initial values for "Balances" sheet
const balancesFields = [BALANCES_SHEET_KEY];

const balancesData: RowData = {
  [BALANCES_SHEET_KEY]: getCurrentDate(),
};

// Init bank-account-data client
const client = await initBankAccountData();

// Get list of requisitions (links)
console.log('Fetching bank account links...');
const requisitions = await getRequisitions(client);

// Generate iterable list - reverse values so oldest requisitions are first
const requisitionsSorted = Object.values(requisitions.results).reverse();

// Loop through requisitions (links)
for (const requisition of requisitionsSorted) {
  // Log reference & id
  const { id, reference } = requisition;
  console.log();
  console.log(`reference: ${reference}`);
  console.log(`id: ${id}`);

  // Configure spreadsheet fields
  balancesFields.push(reference);

  // Validate status is "LN" (successfully linked)
  if (requisition.status !== 'LN') {
    console.warn(`Skipping link - invalid status of "${requisition.status}"`);
    continue;
  }

  // Get first account in requisition
  const accountId = requisition.accounts[0];

  // Fetch account balances
  const balances = await getAccountBalances(client, accountId);

  // Validate balance has been retrieved correctly
  if (!balances) {
    console.warn('Skipping link - error retrieving account balance');
    continue;
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

  // Collect data to persist
  balancesData[reference] = balanceAmount;
}

// Output balances data
console.log();
console.log('Completed bank account data fetch.');
console.log(balancesData);

// Init google-sheet doc
console.log();
console.log('Accessing spreadsheet for update...');
const doc = await initGoogleSheet();

// const balancesSheetHeaders = ['Date', 'BalanceA', 'BalanceB'];
const balancesSheet = await selectSheet(
  doc,
  BALANCES_SHEET_TITLE,
  balancesFields,
);

// Persist data collected above to spreadsheet
await addRowUnique(balancesSheet, balancesData, 'Date', true);

// Output success message
console.log('Completed spreadsheet update.');
