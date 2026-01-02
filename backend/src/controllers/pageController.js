const Page = require('../models/Page');

// List all pages
exports.listPages = async (req, res) => {
  try {
    const pages = await Page.findAll({
      order: [['updated_at', 'DESC']]
    });
    res.json(pages);
  } catch (error) {
    console.error('Error listing pages:', error);
    res.status(500).json({ error: 'Failed to list pages' });
  }
};

// Get single page
exports.getPage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByPk(id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error getting page:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
};

// Create new page
exports.createPage = async (req, res) => {
  try {
    const { title, template } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const page = await Page.create({
      title,
      status: 'draft',
      editor_data: { elements: {}, rootElementIds: [] }
    });
    
    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// Update/Save page
exports.savePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { editor_data, compiled_html, editor_assets, editor_mode } = req.body;
    
    const page = await Page.findByPk(id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    // Convert compiled_html to string if it's an object
    let htmlString = compiled_html;
    if (compiled_html && typeof compiled_html === 'object') {
      htmlString = JSON.stringify(compiled_html);
    }
    
    await page.update({
      editor_data,
      compiled_html: htmlString,
      editor_assets
    });
    
    res.json({ message: 'Page saved successfully', id: page.id });
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: 'Failed to save page' });
  }
};

// Delete page
exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByPk(id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    await page.destroy();
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};
