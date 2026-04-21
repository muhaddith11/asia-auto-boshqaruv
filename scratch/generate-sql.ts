import * as fs from 'fs';
import * as path from 'path';

const catalogPath = path.join(process.cwd(), 'src/app/api/bot-ui/catalog/route.ts');
const content = fs.readFileSync(catalogPath, 'utf-8');

const startMatch = content.indexOf('const data = {');
const endMatch = content.lastIndexOf('};');

if (startMatch === -1 || endMatch === -1) {
  console.error('Katalog topilmadi!');
} else {
  const jsonStr = content.substring(startMatch + 'const data = '.length, endMatch + 1);
  const data = (new Function('return ' + jsonStr))();
  const catalog = data.catalog;

  let values: string[] = [];
  for (const brand in catalog) {
    for (const model in catalog[brand]) {
      const escapedModel = model.trim().replace(/'/g, "''");
      const escapedBrand = brand.trim().replace(/'/g, "''");
      values.push(`('${escapedModel}', '${escapedBrand}')`);
    }
  }

  const sql = `INSERT INTO cars_list (name, brand)\nVALUES\n${values.join(',\n')}\nON CONFLICT (name) DO NOTHING;`;
  fs.writeFileSync('mashinalar_bazasi.sql', sql);
  console.log('mashinalar_bazasi.sql fayli yaratildi! ✅');
}
