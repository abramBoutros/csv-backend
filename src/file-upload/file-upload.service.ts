import { Injectable } from '@nestjs/common';

import { parse as json2csvParse } from 'json2csv';
import { readFile, writeFile } from 'fs/promises';
import { parse as papaParse } from 'papaparse';

import { FileUploadValidator } from './file-upload.validator';

@Injectable()
export class FileUploadService {
  private fileUploadValidator = new FileUploadValidator();

  async getOneSheet(title: string): Promise<any> {
    try {
      const fileContents = await readFile('./data.json', 'utf8');
      const data = JSON.parse(fileContents);

      if (data[title]) {
        return data[title];
      } else {
        throw new Error(`Sheet titled "${title}" not found`);
      }
    } catch (error) {
      throw new Error('Error retrieving sheet: ' + error.message);
    }
  }

  async processFile(file: Express.Multer.File, title: string): Promise<any> {
    const currentDateTime = new Date().toISOString();
    const fileContents = file.buffer.toString('utf8');

    // Modify the papaParse call to include transform
    const parsedData = papaParse(fileContents, {
      header: true,
      dynamicTyping: true, // Automatically converts numeric fields to numbers
      skipEmptyLines: true, // Skips empty lines
    }).data;

    const { validRows, invalidRows } =
      this.fileUploadValidator.validateCsvRows(parsedData);

    if (invalidRows.length > 0) {
      throw new Error('Invalid data format in CSV');
    }

    const existingData = JSON.parse(await readFile('data.json', 'utf8'));
    if (!existingData[title]) {
      existingData[title] = {
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
        data: validRows,
      };
    } else {
      existingData[title].data = validRows;
      existingData[title].updatedAt = currentDateTime;
    }
    await writeFile('data.json', JSON.stringify(existingData, null, 2));

    return existingData[title];
  }

  async getDataJSON(): Promise<any> {
    try {
      const fileContents = await readFile('./data.json', 'utf8');
      const data = JSON.parse(fileContents);

      // Transform the data into the desired format
      return Object.keys(data).map((key) => ({
        title: key,
        createdAt: data[key].createdAt,
        updatedAt: data[key].updatedAt,
      }));
    } catch (error) {
      throw new Error('Data not found');
    }
  }

  async getDataCSV(): Promise<string> {
    try {
      const fileContents = await readFile('./data.json', 'utf8');
      const jsonData = JSON.parse(fileContents);

      const csvData = json2csvParse(jsonData);
      return csvData;
    } catch (error) {
      throw new Error('Data not found');
    }
  }

  async addDataJSON(newData: any): Promise<any> {
    try {
      let existingData: Array<any>;
      try {
        const fileContents = await readFile('./data.json', 'utf8');
        existingData = JSON.parse(fileContents);
      } catch (error) {
        existingData = [];
      }

      const dataToValidate = newData.jsonData ? newData.jsonData : newData;
      const { validRows, invalidRows } =
        this.fileUploadValidator.validateCsvRows([dataToValidate]);

      const updatedData = [...existingData, ...validRows];

      await writeFile('./data.json', JSON.stringify(updatedData, null, 2));
      return { validRows, invalidRows };
    } catch (error) {
      throw new Error('Error adding JSON data: ' + error.message);
    }
  }

  async deleteSheet(title: string): Promise<boolean> {
    try {
      const fileContents = await readFile('./data.json', 'utf8');
      const data = JSON.parse(fileContents);
      if (data[title]) {
        delete data[title];
        await writeFile('./data.json', JSON.stringify(data, null, 2));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error('Error adding JSON data: ' + error.message);
    }
  }

  async updateSheet(title: string, updateData: any): Promise<any> {
    const currentDateTime = new Date().toISOString();
    const existingData = JSON.parse(await readFile('data.json', 'utf8'));

    if (!existingData[title]) {
      throw new Error(`Sheet with title "${title}" not found`);
    }

    const formattedData = updateData.data.map((row: any) => ({
      ...row,
      Revenue: parseFloat(row.Revenue),
      Expenses: parseFloat(row.Expenses),
      Profit: parseFloat(row.Profit),
    }));

    const { validRows, invalidRows } =
      this.fileUploadValidator.validateCsvRows(formattedData);

    existingData[title].data = validRows;
    existingData[title].updatedAt = currentDateTime;
    existingData[title].invalid = invalidRows;

    await writeFile('data.json', JSON.stringify(existingData, null, 2));
    return existingData[title];
  }

  private async saveDataAsJson(data: any, filePath: string): Promise<void> {
    const jsonData = JSON.stringify(data, null, 2);
    await writeFile(filePath, jsonData);
  }
}
