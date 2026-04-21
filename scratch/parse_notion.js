const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'notion_export', 'extracted_data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.md'));

let totalCars = 0;
let totalServices = 0;
let allData = {};

files.forEach(file => {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const lines = content.split('\n').map(l => l.trim());
    
    let currentBrand = file.split(' ')[0]; // fallback
    let currentModel = null;
    
    allData[currentBrand] = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        if (line.startsWith('# ')) {
            const b = line.substring(2).trim();
            if (b && b.toLowerCase() !== 'xizmat narxlari') {
                delete allData[currentBrand];
                currentBrand = b;
                allData[currentBrand] = {};
            }
            continue;
        }

        if (line.startsWith('|')) {
            if (line.includes('---')) continue;
            if (!currentModel) continue;
            
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 2) {
                // Usually [ ID, Name, Price ] or [ Name, Price ]
                let name = '';
                let priceStr = '';
                if (parts.length >= 3) {
                    name = parts[1];
                    priceStr = parts[2];
                } else if (parts.length === 2 && parts[0].length > 5) {
                     name = parts[0];
                     priceStr = parts[1];
                }
                
                name = name.trim();
                priceStr = priceStr.trim();
                
                if (name && priceStr && priceStr.toLowerCase().includes('uzs') || priceStr.replace(/\D/g, '').length > 3) {
                    let numericPrice = parseInt(priceStr.replace(/\D/g, ''), 10);
                    if (!isNaN(numericPrice) && numericPrice > 0) {
                        allData[currentBrand][currentModel].services.push({
                            name,
                            price: numericPrice,
                            rawPrice: priceStr
                        });
                        totalServices++;
                    }
                }
            }
            continue;
        }

        // If it's not empty, not a header, not a table, it's likely a car model
        // but let's exclude some noise
        if (!line.startsWith('[') && !line.startsWith('>') && !line.startsWith('**') && !line.startsWith('-')) {
            if (line.length > 0 && line.length < 50) {
                currentModel = line;
                if (!allData[currentBrand][currentModel]) {
                    allData[currentBrand][currentModel] = { services: [] };
                    totalCars++;
                }
            }
        }
    }
});

let summary = [];
for (const brand in allData) {
    let brandModels = 0;
    let brandServices = 0;
    for (const model in allData[brand]) {
        brandModels++;
        brandServices += allData[brand][model].services.length;
    }
    summary.push(`${brand}: ${brandModels} models, ${brandServices} services`);
}

console.log(`Extracted total ${totalCars} cars and ${totalServices} services.`);
console.log('--- Breakdown ---');
console.log(summary.join('\n'));
console.log('--- Example ---');
const firstBrand = Object.keys(allData)[0];
const firstModel = Object.keys(allData[firstBrand])[0];
console.log(JSON.stringify({ brand: firstBrand, model: firstModel, services: allData[firstBrand][firstModel].services.slice(0,3) }, null, 2));

// Save parsed JSON
fs.writeFileSync(path.join(__dirname, 'parsed_notion_data.json'), JSON.stringify(allData, null, 2));
console.log('Saved to parsed_notion_data.json');
