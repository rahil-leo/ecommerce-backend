const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config({ path: '../.env' });

const categories = [
  {
    name: 'Watches',
    slug: 'watches',
    description: 'Premium collection of watches for all occasions',
    icon: '⌚',
    color: '#FFB6C1',
    displayOrder: 1,
    featured: true
  },
  {
    name: 'Phones',
    slug: 'phones',
    description: 'Latest smartphones and mobile devices',
    icon: '📱',
    color: '#87CEEB',
    displayOrder: 2,
    featured: true
  },
  {
    name: 'Gadgets',
    slug: 'gadgets',
    description: 'Essential gadgets and accessories',
    icon: '🎮',
    color: '#FFD700',
    displayOrder: 3,
    featured: true
  },
  {
    name: 'Dress',
    slug: 'dress',
    description: 'Fashion and clothing collection',
    icon: '👗',
    color: '#FF69B4',
    displayOrder: 4,
    featured: true
  }
];

async function seedCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://jubail:28308000@rahil.f0nsc.mongodb.net/ecommerce?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const created = await Category.insertMany(categories);
    console.log(`✓ Created ${created.length} categories successfully`);

    created.forEach((cat) => {
      console.log(`  - ${cat.icon} ${cat.name} (slug: ${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding categories:', error.message);
    process.exit(1);
  }
}

seedCategories();
