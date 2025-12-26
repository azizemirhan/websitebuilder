/**
 * HTML Import - Module exports
 */

// Parser
export { 
  parseHTML, 
  detectElementType, 
  flattenElements, 
  getParseStats,
  type ParsedElement,
  type ParsedDocument,
} from './html-parser';

// CSS Extractor  
export {
  parseCSS,
  matchRulesToElement,
  computeElementStyles,
  mergeStyles,
  resolveVariables,
  type CSSRule,
  type ExtractedStyles,
} from './css-extractor';

// Element Mapper
export {
  mapParsedToCanvas,
  importHTML,
  type MappedElement,
  type ImportResult,
} from './element-mapper';

// Template Types
export {
  type TemplateVariable,
  type SectionDefinition,
  type TemplateFiles,
  type TemplateSchema,
  type TemplatePreview,
  TEMPLATE_CATEGORIES,
} from './template-types';
