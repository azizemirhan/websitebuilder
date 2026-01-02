const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const Page = require('../models/Page');

// Menu - MenuItem ilişkisi (1:N)
Menu.hasMany(MenuItem, {
  foreignKey: 'menu_id',
  as: 'items',
  onDelete: 'CASCADE'
});

MenuItem.belongsTo(Menu, {
  foreignKey: 'menu_id',
  as: 'menu'
});

// MenuItem - MenuItem ilişkisi (Parent-Child, Self-referencing)
MenuItem.hasMany(MenuItem, {
  foreignKey: 'parent_id',
  as: 'children',
  onDelete: 'CASCADE'
});

MenuItem.belongsTo(MenuItem, {
  foreignKey: 'parent_id',
  as: 'parent'
});

// MenuItem - Page ilişkisi (N:1)
MenuItem.belongsTo(Page, {
  foreignKey: 'page_id',
  as: 'page'
});

module.exports = {
  Menu,
  MenuItem,
  Page
};
