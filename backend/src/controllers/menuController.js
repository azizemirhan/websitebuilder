const { Menu, MenuItem, Page } = require('../models/associations');

// List all menus
exports.listMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      order: [['created_at', 'DESC']],
      include: [{
        model: MenuItem,
        as: 'items',
        attributes: ['id']
      }]
    });
    
    // Add item count
    const menusWithCount = menus.map(menu => ({
      ...menu.toJSON(),
      itemCount: menu.items ? menu.items.length : 0
    }));
    
    res.json(menusWithCount);
  } catch (error) {
    console.error('Error listing menus:', error);
    res.status(500).json({ error: 'Failed to list menus' });
  }
};

// Get single menu with all items (nested)
exports.getMenu = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menu = await Menu.findByPk(id, {
      include: [{
        model: MenuItem,
        as: 'items',
        where: { parent_id: null },
        required: false,
        include: [
          {
            model: MenuItem,
            as: 'children',
            include: [
              {
                model: MenuItem,
                as: 'children',
                include: [
                  {
                    model: MenuItem,
                    as: 'children',
                    // Continue nesting as needed
                  }
                ]
              }
            ]
          },
          {
            model: Page,
            as: 'page',
            attributes: ['id', 'title']
          }
        ],
        order: [['order_index', 'ASC']]
      }]
    });
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).json({ error: 'Failed to get menu' });
  }
};

// Create new menu
exports.createMenu = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const menu = await Menu.create({
      name,
      location: location || null
    });
    
    res.status(201).json(menu);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    
    const menu = await Menu.findByPk(id);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    await menu.update({
      name: name || menu.name,
      location: location !== undefined ? location : menu.location
    });
    
    res.json(menu);
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    await menu.destroy();
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};
