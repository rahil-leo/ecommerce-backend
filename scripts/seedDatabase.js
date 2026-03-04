const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const User = require('../models/User');
const Product = require('../models/Product');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Category.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    console.log('✅ Cleared existing data');

    // 1. Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
        slug: 'clothing',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Books',
        description: 'Books and literature',
        slug: 'books',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Home & Garden',
        description: 'Home decor and garden supplies',
        slug: 'home-garden',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Sports',
        description: 'Sports equipment and accessories',
        slug: 'sports',
        isActive: true,
        isFeatured: false
      }
    ]);
    console.log('✅ Created categories');

    // 2. Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Created admin user');
    console.log('   Email: admin@ecommerce.com');
    console.log('   Password: admin123');

    // 3. Create Regular User
    const regularUser = await User.create({
      name: 'Test User',
      email: 'user@ecommerce.com',
      password: 'user123',
      role: 'user'
    });
    console.log('✅ Created test user');
    console.log('   Email: user@ecommerce.com');
    console.log('   Password: user123');

    // 4. Create Sample Products (Optional)
    const electronicsCategory = categories.find(cat => cat.slug === 'electronics');
    const clothingCategory = categories.find(cat => cat.slug === 'clothing');
    const booksCategory = categories.find(cat => cat.slug === 'books');

    await Product.insertMany([
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation. Perfect for music lovers and professionals. Long battery life and comfortable design.',
        price: 99.99,
        category: electronicsCategory._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            alt: 'Wireless Headphones'
          }
        ],
        brand: 'AudioTech',
        stock: 50,
        rating: 4.5,
        numReviews: 120,
        isActive: true,
        isFeatured: true,
        tags: ['audio', 'wireless', 'electronics'],
        createdAt: new Date()
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with fitness tracking, heart rate monitoring, and notification support. Water-resistant and stylish.',
        price: 199.99,
        discountPrice: 179.99,
        category: electronicsCategory._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            alt: 'Smart Watch'
          }
        ],
        brand: 'TechWear',
        stock: 30,
        rating: 4.7,
        numReviews: 85,
        isActive: true,
        isFeatured: true,
        tags: ['wearable', 'fitness', 'electronics'],
        createdAt: new Date()
      },
      {
        name: 'Classic T-Shirt',
        description: 'Premium cotton t-shirt with comfortable fit. Available in multiple colors. Perfect for casual wear.',
        price: 29.99,
        category: clothingCategory._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            alt: 'Classic T-Shirt'
          }
        ],
        brand: 'FashionCo',
        stock: 100,
        rating: 4.3,
        numReviews: 45,
        isActive: true,
        tags: ['clothing', 'casual', 'cotton'],
        createdAt: new Date()
      },
      {
        name: 'JavaScript Programming Book',
        description: 'Comprehensive guide to modern JavaScript programming. Includes ES6+ features, async programming, and best practices.',
        price: 39.99,
        category: booksCategory._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
            alt: 'Programming Book'
          }
        ],
        brand: 'TechBooks',
        stock: 75,
        rating: 4.8,
        numReviews: 200,
        isActive: true,
        isFeatured: true,
        tags: ['books', 'programming', 'education'],
        createdAt: new Date()
      },
      {
        name: 'Laptop Stand',
        description: 'Ergonomic aluminum laptop stand with adjustable height. Improves posture and airflow for your device.',
        price: 49.99,
        category: electronicsCategory._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
            alt: 'Laptop Stand'
          }
        ],
        brand: 'OfficeEssentials',
        stock: 40,
        rating: 4.6,
        numReviews: 67,
        isActive: true,
        tags: ['office', 'ergonomic', 'accessories'],
        createdAt: new Date()
      },
      {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with excellent cushioning and support. Perfect for daily runs and marathons.',
        price: 89.99,
        discountPrice: 69.99,
        category: categories.find(cat => cat.slug === 'sports')._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
            alt: 'Running Shoes'
          }
        ],
        brand: 'SportPro',
        stock: 60,
        rating: 4.4,
        numReviews: 92,
        isActive: true,
        tags: ['sports', 'footwear', 'running'],
        createdAt: new Date()
      }
    ]);
    console.log('✅ Created sample products');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 You can now login with:');
    console.log('   Admin: admin@ecommerce.com / admin123');
    console.log('   User: user@ecommerce.com / user123');
    console.log('\n🌐 Access your app at: http://localhost:3001');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
