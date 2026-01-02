/**
 * Script to convert NextCommerce sections to JSON template files
 * Run with: node convert-sections.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

// Read HTML and CSS
const html = readFileSync('./nextcommerce-default/index.html', 'utf-8');
const css = readFileSync('./nextcommerce-default/styles.css', 'utf-8');

// Parse HTML
const dom = new JSDOM(html);
const doc = dom.window.document;

// Section definitions
const sections = [
  { selector: '.ncd-categories', name: 'NCD Categories', type: 'custom' },
  { selector: '.ncd-products', name: 'NCD Products', type: 'products' },
  { selector: '.ncd-promo-banners', name: 'NCD Promo Banners', type: 'custom' },
  { selector: '.ncd-brands', name: 'NCD Brands', type: 'custom' },
  { selector: '.ncd-features', name: 'NCD Features', type: 'features' },
  { selector: '.ncd-newsletter', name: 'NCD Newsletter', type: 'custom' },
  { selector: '.ncd-footer', name: 'NCD Footer', type: 'footer' },
  { selector: '.ncd-mobile-menu', name: 'NCD Mobile Menu', type: 'custom' },
  { selector: '.ncd-cart-sidebar', name: 'NCD Cart Sidebar', type: 'custom' },
];

console.log('Converting sections...');

sections.forEach(({ selector, name, type }) => {
  const element = doc.querySelector(selector);
  if (element) {
    console.log(`Found: ${name}`);
  } else {
    console.log(`NOT FOUND: ${selector}`);
  }
});

console.log('Done. Use the Template Converter UI to convert each section manually.');
