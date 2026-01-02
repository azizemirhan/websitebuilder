const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menu_items',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('page', 'custom', 'category'),
    defaultValue: 'custom'
  },
  page_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pages',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  target: {
    type: DataTypes.STRING(20),
    defaultValue: '_self',
    comment: '_self or _blank'
  },
  css_classes: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MenuItem;
