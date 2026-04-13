const fs = require('fs');
const path = require('path');

const FRAGRANCES_ROOT = path.join(__dirname, 'fragfrag');
const PUBLIC_ROOT = path.join(__dirname, 'public', 'assets', 'products', 'fragrances');
const DATA_FILE = path.join(__dirname, 'data', 'unified_products_en_gbp.json');
const BRANDS_FILE = path.join(__dirname, 'data', 'brands.json');

console.log('Starting migration from fragfrag...');

// Clear existing destination for a clean state
if (fs.existsSync(PUBLIC_ROOT)) {
    console.log('Clearing existing product assets...');
    fs.rmSync(PUBLIC_ROOT, { recursive: true, force: true });
}

// Ensure destination exists
if (!fs.existsSync(PUBLIC_ROOT)) {
    fs.mkdirSync(PUBLIC_ROOT, { recursive: true });
}

// Read brands for matching
let knownBrands = [];
try {
    const brandsData = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf8'));
    knownBrands = brandsData.brands || [];
} catch (e) {
    console.error('Error reading brands:', e);
}

const folders = fs.readdirSync(FRAGRANCES_ROOT).filter(f => fs.statSync(path.join(FRAGRANCES_ROOT, f)).isDirectory());

const products = folders.map((folder, index) => {
    const folderPath = path.join(FRAGRANCES_ROOT, folder);
    const destFolder = path.join(PUBLIC_ROOT, folder);

    // Copy folder to public
    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
    }
    const files = fs.readdirSync(folderPath);
    const images = [];
    files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
            fs.copyFileSync(path.join(folderPath, file), path.join(destFolder, file));
            images.push(`/assets/products/fragrances/${encodeURIComponent(folder)}/${file}`);
        }
    });

    // Slugify
    const handle = folder.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Brand matching
    let productBrands = [];
    let primaryBrand = "Premium Fragrance";
    knownBrands.forEach(b => {
        if (folder.toLowerCase().includes(b.name.toLowerCase())) {
            productBrands.push(b.name);
            primaryBrand = b.name;
        }
    });
    if (productBrands.length === 0) {
        productBrands = ["Premium Fragrance"];
    }

    return {
        id: (index + 1).toString(),
        handle: handle,
        title: folder,
        description: `Experience the luxurious scent of ${folder}. Premium authentic fragrance with fast delivery in the UK.`,
        description_html: `<div class="product-description"><h3>${folder}</h3><p>An exceptional fragrance offering unprecedented value and luxury. Perfect for those who appreciate premium scents.</p></div>`,
        sku: `FRAG-${(index + 1).toString().padStart(4, '0')}`,
        price: {
            regular: 49.99,
            sale: null,
            on_sale: false,
            discount_percent: 0,
            currency: "GBP"
        },
        category: "Fragrances",
        brands: productBrands,
        primary_brand: primaryBrand,
        tags: ["perfume", "uk", "premium", "fragrance", ...primaryBrand.toLowerCase().split(' ')],
        images: images,
        is_combo: false,
        featured: false,
        popularity: 0,
        status: "active",
        slug: handle,
        categories: ["Fragrances"]
    };
});

const output = {
    products: products
};

fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));
console.log(`Successfully migrated ${products.length} fragrances.`);
