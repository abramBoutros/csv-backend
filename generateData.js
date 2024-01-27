const fs = require('fs');
const path = require('path');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMonthData(month, year = 2024) {
  const revenue = getRandomInt(9000, 20000);
  const expenses = getRandomInt(4000, 10000);
  const profit = revenue - expenses;
  return {
    Month: new Date(year, month - 1, 1).toLocaleString('default', {
      month: 'long',
    }),
    Revenue: revenue,
    Expenses: expenses,
    Profit: profit,
  };
}

const data = {};

for (let i = 1; i <= 20; i++) {
  const sheetData = {};
  const currentDate = new Date();
  sheetData.createdAt = currentDate.toISOString();
  sheetData.updatedAt = currentDate.toISOString();
  sheetData.data = Array.from({ length: 12 }, (_, idx) =>
    generateMonthData(idx + 1),
  );
  data[`sheet${i}`] = sheetData;
}

const filePath = path.join(__dirname, 'generated_data.json');
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`Data generated at ${filePath}`);
