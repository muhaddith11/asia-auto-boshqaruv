import * as fs from 'fs';
import * as path from 'path';

// This script extracts services and prices from the bot catalog
// and generates a SQL file for Supabase insertion.

async function generateServicesSQL() {
  const catalogPath = path.join(process.cwd(), 'src/app/api/bot-ui/catalog/route.ts');
  const content = fs.readFileSync(catalogPath, 'utf-8');

  // Extract the 'data' constant from the file
  const dataMatch = content.match(/const data = (\{[\s\S]+?\});/);
  if (!dataMatch) {
    console.error('Catalog data not found!');
    return;
  }

  const catalogData = eval(`(${dataMatch[1]})`);
  const catalog = catalogData.catalog;

  let sql = 'INSERT INTO services_list (name, price, brand, car_model)\nVALUES\n';
  const values: string[] = [];

  for (const brand in catalog) {
    for (const model in catalog[brand]) {
      const services = catalog[brand][model];
      services.forEach((service: any) => {
        // Escape single quotes in names
        const escapedName = service.name.replace(/'/g, "''");
        values.push(`('${escapedName}', ${service.price}, '${brand}', '${model}')`);
      });
    }
  }

  // Split into chunks of 1000 to avoid SQL limits if necessary
  // But for now, we'll just write one big list or multiple INSERTs
  
  const chunks = [];
  const chunkSize = 500;
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    chunks.push(`INSERT INTO services_list (name, price, brand, car_model)\nVALUES\n${chunk.join(',\n')};`);
  }

  fs.writeFileSync('xizmatlar_bazasi.sql', chunks.join('\n\n'));
  console.log(`Generated SQL with ${values.length} services.`);
}

generateServicesSQL();
