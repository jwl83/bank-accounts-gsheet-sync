import 'dotenv/config';
import { JWT } from 'google-auth-library';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';

export type CellData = string | number | boolean | Date;

export type RowData = Record<string, CellData>;

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export const initGoogleSheet = async () => {
  // Init JWT authentication using email & key from env vars
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  // Init gSheet
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
  await doc.loadInfo();

  return doc;
};

export const selectSheet = async (
  doc: GoogleSpreadsheet,
  title: string,
  headerValues: string[],
) => {
  // Attempt to select exist sheet with title
  let sheet = doc.sheetsByTitle[title];

  // If existing sheet does not exist, create it
  if (!sheet) {
    sheet = await doc.addSheet({
      title,
      headerValues,
    });

    // Resize new sheet to a single row, with column count matching headers
    await sheet.resize({
      columnCount: headerValues.length,
      rowCount: 1,
    });
  }

  await sheet.loadHeaderRow();

  // Handle headers modification
  if (JSON.stringify(sheet.headerValues) !== JSON.stringify(headerValues)) {
    // Resize sheet with column count matching headers
    await sheet.resize({
      columnCount: headerValues.length,
      rowCount: sheet.gridProperties.rowCount,
    });

    await sheet.setHeaderRow(headerValues);
  }

  return sheet;
};

export const addRowUnique = async (
  sheet: GoogleSpreadsheetWorksheet,
  newRow: RowData,
  uniqueKey: string,
  updateExisting = false,
) => {
  // Retreive existing rows from sheet
  const rows = await sheet.getRows();

  // Check if row to be added already exists in sheet
  const matchedRow = rows.find(
    (row) => row.get(uniqueKey) === newRow[uniqueKey],
  );

  // Handle condition where row to be added already exists
  if (matchedRow) {
    // Update values in row if updateExisting argument set
    if (updateExisting) {
      matchedRow.assign(newRow);
      await matchedRow.save();
    }

    return;
  }

  // Where new row doesn't exist, add it
  return sheet.addRow(newRow);
};

export const addRowsUnique = async (
  sheet: GoogleSpreadsheetWorksheet,
  newRows: RowData[],
  uniqueKey: string,
  updateExisting = false,
) => {
  // Retreive existing rows from sheet
  const rows = await sheet.getRows();

  // Loop through each new row to be added
  for (const newRow of newRows) {
    // Check if row to be added already exists in sheet
    const matchedRow = rows.find(
      (row) => row.get(uniqueKey) === newRow[uniqueKey],
    );

    // Handle condition where row to be added already exists
    if (matchedRow) {
      // Update values in row if updateExisting argument set
      if (updateExisting) {
        matchedRow.assign(newRow);
        await matchedRow.save();
      }

      continue;
    }

    // Where new row doesn't exist, add it
    await sheet.addRow(newRow);
  }
};
