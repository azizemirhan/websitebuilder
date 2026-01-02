const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft'
  },
  editor_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  compiled_html: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  editor_assets: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'pages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Page;
