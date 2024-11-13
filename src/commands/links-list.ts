import {
  initBankAccountData,
  getRequisitions,
} from '../services/bank-account-data';

// Init bank-account-data client
const client = await initBankAccountData();

// Get list of requisitions
const requisitions = await getRequisitions(client);

// Output results
console.log(requisitions.results);
