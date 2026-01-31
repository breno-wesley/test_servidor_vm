import db, { dbRun, dbGet, dbAll } from './db';
import bcrypt from 'bcrypt';

export async function initializeDatabase() {
  // Create users table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create products table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create carts table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create cart_items table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(cart_id, product_id)
    )
  `);

  // Create sales table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create sale_items table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Seed admin user if not exists
  const adminExists = await dbGet('SELECT id FROM users WHERE email = ?', 'admin@pharmacy.com');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await dbRun(
      'INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, 1)',
      'admin@pharmacy.com',
      hashedPassword,
      'Administrator'
    );
    console.log('✓ Admin user created (email: admin@pharmacy.com, password: admin123)');
  }

  // Seed products if table is empty
  const productCount = await dbGet('SELECT COUNT(*) as count FROM products') as { count: number };
  if (productCount.count === 0) {
    const products = [
      { name: 'Paracetamol 500mg', description: 'Analgésico e antitérmico', price: 8.50, stock: 100, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { name: 'Dipirona 1g', description: 'Analgésico e antitérmico potente', price: 12.90, stock: 80, image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
      { name: 'Ibuprofeno 600mg', description: 'Anti-inflamatório não esteroidal', price: 15.00, stock: 60, image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
      { name: 'Amoxicilina 500mg', description: 'Antibiótico de amplo espectro', price: 25.00, stock: 50, image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
      { name: 'Omeprazol 20mg', description: 'Protetor gástrico', price: 18.50, stock: 90, image_url: 'https://images.unsplash.com/photo-1550572017-4a6e8e0b0b5f?w=400' },
      { name: 'Losartana 50mg', description: 'Anti-hipertensivo', price: 22.00, stock: 70, image_url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400' },
      { name: 'Metformina 850mg', description: 'Antidiabético oral', price: 20.00, stock: 65, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { name: 'Atorvastatina 20mg', description: 'Redutor de colesterol', price: 28.00, stock: 55, image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
      { name: 'Captopril 25mg', description: 'Anti-hipertensivo', price: 16.50, stock: 75, image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400' },
      { name: 'Dorflex', description: 'Relaxante muscular', price: 14.00, stock: 85, image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
      { name: 'Vitamina C 1g', description: 'Suplemento vitamínico', price: 10.00, stock: 120, image_url: 'https://images.unsplash.com/photo-1550572017-4a6e8e0b0b5f?w=400' },
      { name: 'Complexo B', description: 'Vitaminas do complexo B', price: 19.00, stock: 95, image_url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400' }
    ];

    for (const product of products) {
      await dbRun(
        'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
        product.name,
        product.description,
        product.price,
        product.stock,
        product.image_url
      );
    }
    console.log(`✓ ${products.length} products seeded`);
  }

  console.log('✓ Database initialized successfully');
}
