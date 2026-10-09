const fs = require('fs');
const files = [
  'components/SidebarLayout.tsx', 
  'app/generator/dashboard/page.tsx', 
  'app/picker/dashboard/page.tsx', 
  'app/admin/dashboard/page.tsx'
];

files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/>\$/g, '>₹'); // Fixes UI display `>$100` -> `>₹100`
  fs.writeFileSync(f, text, 'utf8');
});
console.log('Fixed currency UI');
