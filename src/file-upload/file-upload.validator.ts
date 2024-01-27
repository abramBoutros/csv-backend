import Ajv from 'ajv';

const ajv = new Ajv();

const csvRowSchema = {
  type: 'object',
  properties: {
    Month: { type: 'string' },
    Revenue: { type: 'number' },
    Expenses: { type: 'number' },
    Profit: { type: 'number' },
  },
  required: ['Month', 'Revenue', 'Expenses', 'Profit'],
  additionalProperties: false,
};

export class FileUploadValidator {
  validateCsvRows(rows: any[]): { validRows: any[]; invalidRows: any[] } {
    const validate = ajv.compile(csvRowSchema);
    const validRows = [];
    const invalidRows = [];

    rows.forEach((row) => {
      if (validate(row)) {
        validRows.push(row);
      } else {
        invalidRows.push({ row, errors: validate.errors });
      }
    });

    return { validRows, invalidRows };
  }
}
