const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const Page = require('./models/Page');
const pagesRouter = require('./routes/pages');
const menusRouter = require('./routes/menus');
require('./models/associations'); // Load model associations

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/builder', pagesRouter);
app.use('/api/builder', menusRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and seed data
async function initializeDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');
    
    // Check if we need to seed data
    const count = await Page.count();
    if (count === 0) {
      console.log('📝 Seeding initial pages...');
      await Page.bulkCreate([
        {
          title: 'Ana Sayfa',
          status: 'published',
          editor_data: { elements: {}, rootElementIds: [] }
        },
        {
          title: 'Hakkımızda',
          status: 'draft',
          editor_data: { elements: {}, rootElementIds: [] }
        },
        {
          title: 'İletişim',
          status: 'draft',
          editor_data: { elements: {}, rootElementIds: [] }
        }
      ]);
      console.log('✅ Initial pages created');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api/builder`);
  });
}

startServer();
