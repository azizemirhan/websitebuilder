const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const menuItemController = require('../controllers/menuItemController');

// Menu routes
router.get('/menus', menuController.listMenus);
router.get('/menus/:id', menuController.getMenu);
router.post('/menus', menuController.createMenu);
router.put('/menus/:id', menuController.updateMenu);
router.delete('/menus/:id', menuController.deleteMenu);

// Menu item routes
router.get('/menus/:menuId/items', menuItemController.getMenuItems);
router.post('/menus/:menuId/items', menuItemController.createMenuItem);
router.post('/menus/:menuId/items/reorder', menuItemController.reorderMenuItems);
router.put('/menu-items/:id', menuItemController.updateMenuItem);
router.delete('/menu-items/:id', menuItemController.deleteMenuItem);

module.exports = router;
