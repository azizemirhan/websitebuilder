const { MenuItem, Page } = require('../models/associations');

// Get all items for a menu
exports.getMenuItems = async (req, res) => {
  try {
    const { menuId } = req.params;
    
    const items = await MenuItem.findAll({
      where: { menu_id: menuId, parent_id: null },
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
                  as: 'children'
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
    });
    
    res.json(items);
  } catch (error) {
    console.error('Error getting menu items:', error);
    res.status(500).json({ error: 'Failed to get menu items' });
  }
};

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { title, url, type, page_id, parent_id, target, css_classes } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Get max order_index for this parent
    const maxOrderItem = await MenuItem.findOne({
      where: { 
        menu_id: menuId,
        parent_id: parent_id || null
      },
      order: [['order_index', 'DESC']]
    });
    
    const order_index = maxOrderItem ? maxOrderItem.order_index + 1 : 0;
    
    const item = await MenuItem.create({
      menu_id: menuId,
      parent_id: parent_id || null,
      title,
      url: url || null,
      type: type || 'custom',
      page_id: page_id || null,
      target: target || '_self',
      css_classes: css_classes || null,
      order_index
    });
    
    // Fetch with relations
    const createdItem = await MenuItem.findByPk(item.id, {
      include: [{
        model: Page,
        as: 'page',
        attributes: ['id', 'title']
      }]
    });
    
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, type, page_id, parent_id, target, css_classes } = req.body;
    
    const item = await MenuItem.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    await item.update({
      title: title !== undefined ? title : item.title,
      url: url !== undefined ? url : item.url,
      type: type !== undefined ? type : item.type,
      page_id: page_id !== undefined ? page_id : item.page_id,
      parent_id: parent_id !== undefined ? parent_id : item.parent_id,
      target: target !== undefined ? target : item.target,
      css_classes: css_classes !== undefined ? css_classes : item.css_classes
    });
    
    // Fetch with relations
    const updatedItem = await MenuItem.findByPk(id, {
      include: [{
        model: Page,
        as: 'page',
        attributes: ['id', 'title']
      }]
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    await item.destroy();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// Reorder menu items
exports.reorderMenuItems = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { items } = req.body; // Array of { id, parent_id, order_index }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    // Update all items in a transaction
    const sequelize = MenuItem.sequelize;
    await sequelize.transaction(async (t) => {
      for (const itemData of items) {
        await MenuItem.update({
          parent_id: itemData.parent_id || null,
          order_index: itemData.order_index
        }, {
          where: { id: itemData.id, menu_id: menuId },
          transaction: t
        });
      }
    });
    
    res.json({ message: 'Menu items reordered successfully' });
  } catch (error) {
    console.error('Error reordering menu items:', error);
    res.status(500).json({ error: 'Failed to reorder menu items' });
  }
};
