
const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'Códigos', 'Lojas', 'Perfumes', 'Reino_Unido', '7999', 'perfumUkStripe', 'data', 'unified_products_en_gbp.json');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replacements
    content = content.replace(/ und /g, ' and ');
    content = content.replace(/ IE the best price/g, ' at the best price');
    content = content.replace(/premium men-fragrances/g, "Premium men's fragrances");
    content = content.replace(/3-teiliges WoHerren/g, "3-Piece Women's");
    content = content.replace(/premium Düfte uk/g, 'Premium Fragrances UK');
    content = content.replace(/75% OFF/g, '70% OFF');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleanup successful!');
} catch (err) {
    console.error('Error cleaning file:', err);
}
