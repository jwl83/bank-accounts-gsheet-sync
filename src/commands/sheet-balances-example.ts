import {
  initGoogleSheet,
  selectSheet,
  addRowUnique,
} from '../services/google-sheet';
import { getCurrentDate } from 'src/services/date';

// Init google-sheet doc
const doc = await initGoogleSheet();

const balancesSheetTitle = 'ExampleBalances';

const balancesSheetHeaders = ['Date', 'BalanceA', 'BalanceB'];

const newBalanceRow = {
  Date: getCurrentDate(),
  BalanceA: 12.34,
  BalanceB: 56.78,
};

const balancesSheet = await selectSheet(
  doc,
  balancesSheetTitle,
  balancesSheetHeaders,
);

await addRowUnique(balancesSheet, newBalanceRow, 'Date', true);
