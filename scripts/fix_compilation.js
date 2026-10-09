const fs = require('fs');
let t = fs.readFileSync('app/generator/schedule-pickup/page.tsx', 'utf8');

// Remove currentTotalWeight and replace its usages with weight
t = t.replace('const currentTotalWeight = items.reduce((acc, item) => acc + item.weight, 0);', '');
t = t.replace(/currentTotalWeight/g, 'weight');

// Replace items[0]?.type with wasteType
t = t.replace(/items\[0\]\?\.type\s*\|\|\s*"Mixed recyclables"/g, 'wasteType');

// Put back the correct items array definition in the request payload
t = t.replace(/items,/g, 'items: [{ type: detectedType, weight }],');

fs.writeFileSync('app/generator/schedule-pickup/page.tsx', t, 'utf8');
console.log('Fixed');
