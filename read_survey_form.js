const XLSX = require('xlsx');
const filePath = 'c:\\Users\\ndebelem.ZINGSERVER1\\Desktop\\2026\\Manapools\\Survey Form.xlsx';
try {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (data.length > 0) {
    const headers = data[0];
    const sample = data[1] || [];
    headers.forEach((h, i) => {
      if (h) {
        console.log(`${i}: ${h} (Sample: ${sample[i]})`);
      }
    });
  }
} catch (e) { console.error(e); }
