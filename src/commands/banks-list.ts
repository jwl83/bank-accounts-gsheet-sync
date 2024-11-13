import {
  initBankAccountData,
  getInstitutions,
} from '../services/bank-account-data';

// Init bank-account-data client
const client = await initBankAccountData();

// Get list of institutions (banks)
const institutions = await getInstitutions(client);

// Format results & output
const output: Record<string, string> = {};
institutions.forEach((item) => {
  output[item.id] = item.name;
});
console.log(output);
