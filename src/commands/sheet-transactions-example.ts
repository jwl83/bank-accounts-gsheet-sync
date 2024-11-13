import {
  initGoogleSheet,
  selectSheet,
  addRowsUnique,
  RowData,
} from '../services/google-sheet';

// Init google-sheet doc
const doc = await initGoogleSheet();

const transactionsSheetTitle = 'ExampleTransactions';

const transactionsSheetHeaders = ['ID', 'Date', 'In', 'Out', 'Description'];

const newTransactionsRows: RowData[] = [
  {
    ID: '1',
    Date: '2024-10-05',
    // In: '',
    Out: 1.11,
    Description: 'One Out',
  },
  {
    ID: '2',
    Date: '2024-10-05',
    In: 2.22,
    // Out: '',
    Description: 'Two In',
  },
  {
    ID: '3',
    Date: '2024-10-05',
    // In: '',
    Out: 3.33,
    Description: 'Three Out',
  },
];

const transactionsSheet = await selectSheet(
  doc,
  transactionsSheetTitle,
  transactionsSheetHeaders,
);

await addRowsUnique(transactionsSheet, newTransactionsRows, 'ID');
