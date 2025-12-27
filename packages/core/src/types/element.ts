/**
 * Element Types - Canvas'ta kullanılacak tüm element türleri
 */

export type ElementType =
  | 'container'
  | 'text'
  | 'button'
  | 'image'
  | 'input'
  | 'icon'
  | 'slider';

/**
 * CSS Style Properties
 * Faz 1'de temel properties, ilerleyen fazlarda genişletilecek
 */
export interface StyleProperties {
  // Position & Layout - support both pixel numbers and CSS strings (%, auto, calc)
  position?: 'absolute' | 'relative' | 'fixed' | 'static';
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  boxSizing?: 'content-box' | 'border-box' | 'inherit' | 'initial' | 'unset';

  // Spacing - support both number and string
  padding?: string | number;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  margin?: string | number;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;

  // Visual
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Border
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomLeftRadius?: number;
  border?: string;
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';

  // Box Shadow (CSS string format)
  boxShadow?: string;

  // Background & Gradients
  background?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';

  // Filters & Effects
  filter?: string;
  backdropFilter?: string;
  mixBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'difference' | 'exclusion';

  // Other
  opacity?: number;
  cursor?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  zIndex?: number;
  transform?: string;
  transformOrigin?: string;
  transition?: string;

  // Typography
  letterSpacing?: number;
  wordSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: string;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';

  // Display
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'inline-flex' | 'inline-grid' | 'inline' | 'none';

  // Flexbox Container
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  gap?: number;
  rowGap?: number;
  columnGap?: number;


  flex?: string | number; // shorthand
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | 'auto';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifySelf?: 'auto' | 'normal' | 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'left' | 'right' | 'baseline';
  order?: number;

  // Grid Container
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';

  // Grid Item
  gridColumn?: string;
  gridRow?: string;
  gridColumnStart?: number | 'auto';
  gridColumnEnd?: number | 'auto';
  gridRowStart?: number | 'auto';
  gridRowEnd?: number | 'auto';
}

/**
 * Base Element - Tüm elementlerin ortak özellikleri
 */
export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  style: StyleProperties;
  children: string[];
  parentId: string | null;
  locked?: boolean;
  hidden?: boolean;
  props?: Record<string, any>;
}

/**
 * Container Element - Box model element
 */
export interface ContainerElement extends BaseElement {
  type: 'container';
  props?: {
    tag?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'nav';
    autoLayout?: {
      widthMode: 'fixed' | 'hug' | 'fill';
      heightMode: 'fixed' | 'hug' | 'fill';
    };
    constraints?: {
      horizontal: 'left' | 'right' | 'left-right' | 'center' | 'scale';
      vertical: 'top' | 'bottom' | 'top-bottom' | 'center' | 'scale';
    };
  };
}

/**
 * Text Element - Metin içeren element
 */
export interface TextElement extends BaseElement {
  type: 'text';
  props: {
    content: string;
    tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  };
}

/**
 * Button Element
 */
export interface ButtonElement extends BaseElement {
  type: 'button';
  props: {

    text: string;
    onClick?: string;
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
  };
}

/**
 * Image Element
 */
export interface ImageElement extends BaseElement {
  type: 'image';
  props: {
    src: string;
    alt?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  };
}

/**
 * Input Element
 */
export interface InputElement extends BaseElement {
  type: 'input';
  props: {
    placeholder?: string;
    inputType?: 'text' | 'email' | 'password' | 'number' | 'tel';
    value?: string;
  };
}

/**
 * Icon Element - SVG icon element
 */
export interface IconElement extends BaseElement {
  type: 'icon';
  props: {
    iconName: 'search' | 'user' | 'heart' | 'cart' | 'menu' | 'close' | 'plus' | 'minus' | 'check' | 'arrow-left' | 'arrow-right' | 'chevron-down' | 'chevron-up' | 'star' | 'trash' | 'edit' | 'eye' | 'share';
    strokeWidth?: number;
  };
}

/**
 * Slide Data - Individual slide configuration
 */
export interface SlideData {
  id: string;
  backgroundImage?: string;
  backgroundColor?: string;
  overlay?: string;  // e.g., "rgba(0,0,0,0.4)"
  label?: string;
  title?: string;
  titleHighlight?: string;  // Italic/highlighted part
  description?: string;
  buttons?: {
    text: string;
    variant: 'primary' | 'outline';
    href?: string;
  }[];
}

/**
 * Slider Element - Interactive slider/carousel
 */
export interface SliderElement extends BaseElement {
  type: 'slider';
  props: {
    slides: SlideData[];
    autoPlay?: boolean;
    interval?: number;  // milliseconds, default 6000
    showDots?: boolean;
    showArrows?: boolean;
    transition?: 'fade' | 'slide';  // animation type
  };
}

/**
 * Union type - Tüm element türleri
 */
export type Element =
  | ContainerElement
  | TextElement
  | ButtonElement
  | ImageElement
  | InputElement
  | IconElement
  | SliderElement;

/**
 * Canvas State - Canvas'ın tam state'i
 */
export interface CanvasState {
  elements: Record<string, Element>;
  rootElementIds: string[];
  selectedElementIds: string[];
  hoveredElementId: string | null;
}

/**
 * Canvas View State - Zoom, pan vs
 */
export interface CanvasViewState {
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
}
