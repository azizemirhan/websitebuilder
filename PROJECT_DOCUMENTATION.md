# 🎨 Website Builder - Proje Detaylı Dökümantasyon

## 📌 İçindekiler

1. [Proje Hakkında](#proje-hakkında)
2. [Mimari Tasarım](#mimari-tasarım)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Klasör Yapısı](#klasör-yapısı)
5. [State Management](#state-management)
6. [Veri Akışı](#veri-akışı)
7. [Faz 1 Detayları](#faz-1-detayları)
8. [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
9. [Geliştirme Kılavuzu](#geliştirme-kılavuzu)
10. [İleri Fazlar](#ileri-fazlar)

---

## 🎯 Proje Hakkında

### Vizyon
Professional website builder, kullanıcıların kod bilgisi olmadan Figma kalitesinde tasarım detaylarıyla web siteleri oluşturmasını sağlayan bir visual editor'dür. Webflow, Framer, Builder.io gibi piyasadaki profesyonel araçların seviyesinde veya üstünde bir deneyim sunmayı hedefler.

### Temel Hedefler

#### 1. **Figma-Level Tasarım Kontrolü**
- Her CSS property'yi granular olarak kontrol edebilme
- Border radius'un her köşesini ayrı ayarlayabilme
- Advanced shadows, gradients, blend modes
- Pixel-perfect positioning
- Professional typography controls

#### 2. **Webflow-Level Builder Özellikleri**
- Visual canvas editor
- Sürükle-bırak ile element ekleme/düzenleme
- Responsive breakpoint sistemi
- Component-based architecture
- CMS entegrasyonu

#### 3. **Developer-Friendly Export**
- Temiz, maintainable React kodu
- TypeScript support
- Modern best practices (hooks, functional components)
- Özelleştirilebilir export templates

#### 4. **Performance & Scale**
- Binlerce element ile çalışabilme
- 60 FPS smooth interactions
- Optimized rendering pipeline
- Lazy loading ve code splitting

---

## 🏗️ Mimari Tasarım

### Mimari Felsefe

Proje, **modüler monorepo** mimarisi üzerine kurulmuştur. Her package kendi sorumluluk alanına sahiptir ve diğer package'lardan mümkün olduğunca bağımsızdır.

### Temel Prensipler

#### 1. **Separation of Concerns**
```
Core (Business Logic) → Canvas (Rendering) → Editor (UI)
```

- **Core**: State, types, utilities - UI'dan bağımsız
- **Canvas**: Rendering logic - Editor UI'dan bağımsız
- **Editor**: UI components - Canvas'a depend eder ama ondan ayrı

#### 2. **Intermediate Representation (IR)**

Canvas'ta gösterilen her şey aslında bir **JSON tree**'dir:

```typescript
{
  "id": "elem-123",
  "type": "container",
  "style": {
    "width": 300,
    "height": 200,
    "backgroundColor": "#ffffff"
  },
  "children": ["elem-456", "elem-789"]
}
```

**Avantajları:**
- Undo/Redo kolayca implement edilir (state snapshot)
- Serialization/deserialization doğal (save/load)
- Backend'e göndermek kolay
- Export engine sadece JSON → Code dönüşümü yapar

#### 3. **Unidirectional Data Flow**

```
User Action → Store Action → State Update → React Re-render → Visual Update
                                    ↓
                            History Store (Snapshot)
```

Zustand + Immer kullanarak immutable updates garantilenmiş.

#### 4. **Component-Based, But Not React Components**

Element'ler aslında React component'i değil, JSON data'sı. Render time'da React component'ine dönüşürler:

```typescript
// Store'da tutulan
const element = {
  type: 'button',
  props: { text: 'Click me' }
}

// Render time'da
<ButtonRenderer element={element} />
```

Bu sayede:
- Element'ler serialize edilebilir
- Canvas dışında da kullanılabilir (preview, export)
- Testing daha kolay

### Monorepo Yapısı

```
website-builder/
├── packages/               # Reusable packages
│   ├── core/              # Business logic, types, state
│   ├── canvas/            # Rendering engine
│   └── editor/            # UI components
├── apps/                  # Applications
│   └── web/              # Main web app
└── tools/                # Build tools, scripts (ileride)
```

**Neden Monorepo?**

✅ **Code Sharing**: Packages arası type sharing garantili
✅ **Atomic Changes**: Tek PR ile birden fazla package güncellenebilir
✅ **Easier Refactoring**: Cross-package refactoring kolay
✅ **Consistent Versioning**: Tüm packages senkron versiyonlanır
✅ **Better DX**: Tek komut ile tüm uygulamayı çalıştır

---

## 💻 Teknoloji Stack

### Frontend Framework

#### **React 18.2+**
**Neden React?**
- ✅ Largest ecosystem
- ✅ Concurrent features (Suspense, transitions)
- ✅ Virtual DOM optimizations
- ✅ Massive talent pool
- ✅ Excellent TypeScript support

**Alternatives Considered:**
- Vue: Daha az complex editor'ler için iyi, ama large-scale için React daha proven
- Svelte: Performance iyi ama ecosystem küçük, hiring zor
- Angular: Over-engineered, DX kötü

#### **TypeScript 5.3+**
**Neden TypeScript?**
- ✅ Type safety → Daha az bug
- ✅ Better refactoring
- ✅ IntelliSense → Faster development
- ✅ Self-documenting code
- ✅ Large-scale apps için must-have

Complex bir editor'de type safety olmadan development nightmare olur. TypeScript bu projenin can damarı.

### State Management

#### **Zustand 4.4+**
**Neden Zustand?**
- ✅ Minimal boilerplate (Redux'tan çok daha az kod)
- ✅ Hooks-based API (React-friendly)
- ✅ No Provider hell
- ✅ DevTools support
- ✅ Middleware support (Immer, persist)
- ✅ Small bundle size (~1kb)

**Alternatives Considered:**
- Redux Toolkit: Boilerplate fazla, öğrenme eğrisi dik
- Recoil: Facebook experimental, production-ready değil
- MobX: Observable pattern karmaşık, debugging zor
- Jotai: Atom-based iyi ama Zustand'dan daha az mature

**Zustand Kullanım Örneği:**
```typescript
const useCanvasStore = create(immer((set) => ({
  elements: {},
  addElement: (element) => set((state) => {
    state.elements[element.id] = element;
  })
})));

// Component'te
const { elements, addElement } = useCanvasStore();
```

Redux ile aynı işlem 5-6 kat daha fazla kod gerektirir.

#### **Immer 10.0+**
**Neden Immer?**
- ✅ Immutable updates → Mutable syntax ile
- ✅ Structural sharing (performance)
- ✅ Zustand middleware

**Immer Örneği:**
```typescript
// Immer ile
set((state) => {
  state.elements[id].style.width = 500;
});

// Immer olmadan
set({
  elements: {
    ...state.elements,
    [id]: {
      ...state.elements[id],
      style: {
        ...state.elements[id].style,
        width: 500
      }
    }
  }
});
```

### Build Tools

#### **Vite 5.0+**
**Neden Vite?**
- ✅ Lightning fast HMR (<50ms)
- ✅ Native ES modules
- ✅ Optimized production build (Rollup)
- ✅ First-class TypeScript support
- ✅ Rich plugin ecosystem

**Alternatives Considered:**
- Webpack: Slow, complex config
- Parcel: Auto-config iyi ama customization zor
- esbuild: Super fast ama plugin ecosystem az

**Vite Development Experience:**
- Instant server start
- HMR ~10-50ms (Webpack ~1000ms+)
- Production build optimized

#### **Turborepo 1.11+**
**Neden Turborepo?**
- ✅ Incremental builds (sadece değişen packages build edilir)
- ✅ Remote caching (CI/CD super fast)
- ✅ Parallel execution
- ✅ Task pipelines

**Alternatives Considered:**
- Nx: Feature-rich ama over-engineered
- Lerna: Eskidi, maintenance zayıf
- pnpm workspaces: Basic, orchestration yok

**Turborepo ile Kazanılan Hız:**
- Initial build: 30 saniye
- Değişiklik sonrası: 3-5 saniye (incremental)
- CI/CD: Remote cache ile 90% faster

#### **pnpm 8.12+**
**Neden pnpm?**
- ✅ Disk space efficient (hard links)
- ✅ Faster than npm/yarn (~2x)
- ✅ Strict dependencies (phantom dependencies yok)
- ✅ Monorepo support

**Disk Usage Comparison:**
```
npm:  500 MB (node_modules)
yarn: 480 MB (node_modules)
pnpm: 150 MB (symlinks to global store)
```

### Utility Libraries

#### **nanoid**
Unique ID generation (UUID'den küçük ve daha hızlı)

```typescript
import { nanoid } from 'nanoid';
const id = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"
```

#### **lucide-react**
Icon library (Feather Icons fork, React optimize)
- ✅ Tree-shakeable
- ✅ Modern tasarım
- ✅ Customizable

---

## 📁 Klasör Yapısı

### Root Level
```
website-builder/
├── packages/           # Reusable packages
├── apps/              # Applications
├── turbo.json         # Turborepo config
├── pnpm-workspace.yaml # pnpm workspace config
├── package.json       # Root package.json
├── tsconfig.json      # Base TypeScript config
└── README.md         # Bu dosya
```

### Package: @builder/core

**Sorumluluk**: Business logic, types, state management

```
packages/core/
├── src/
│   ├── types/             # Type definitions
│   │   ├── element.ts     # Element types
│   │   ├── history.ts     # History types
│   │   └── index.ts       # Type exports
│   ├── store/             # State management
│   │   ├── canvas-store.ts   # Canvas state
│   │   ├── history-store.ts  # Undo/Redo
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── element-helpers.ts # Element utilities
│   │   └── index.ts
│   └── index.ts           # Main export
├── package.json
└── tsconfig.json
```

**Key Files:**

- **`types/element.ts`**: 
  - `Element` type definitions
  - `StyleProperties` interface
  - `CanvasState` interface

- **`store/canvas-store.ts`**: 
  - Element CRUD operations
  - Selection management
  - Hierarchy operations

- **`store/history-store.ts`**: 
  - Undo/Redo state
  - History stack management

- **`utils/element-helpers.ts`**: 
  - Element traversal
  - Style conversion
  - Tree manipulation

### Package: @builder/canvas

**Sorumluluk**: Canvas rendering, interactions

```
packages/canvas/
├── src/
│   ├── components/        # Canvas components
│   │   ├── CanvasRenderer.tsx      # Main canvas
│   │   ├── ElementRenderer.tsx     # Element renderer
│   │   ├── SelectionBox.tsx        # Selection UI
│   │   ├── ResizeHandles.tsx       # Resize handles
│   │   └── index.ts
│   ├── hooks/             # Canvas hooks
│   │   ├── useCanvasDrag.ts       # Drag logic
│   │   ├── useCanvasZoom.ts       # Zoom/pan
│   │   ├── useElementResize.ts    # Resize logic
│   │   └── index.ts
│   ├── utils/             # Canvas utilities
│   │   ├── coordinate-helpers.ts  # Coordinate math
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Key Responsibilities:**

1. **Rendering**: Element'leri DOM'a render etmek
2. **Interactions**: Drag, resize, select handle etmek
3. **Visual Feedback**: Selection highlight, resize handles göstermek
4. **Viewport Management**: Zoom, pan, scroll yönetmek

### Package: @builder/editor

**Sorumluluk**: Editor UI, panels, toolbar

```
packages/editor/
├── src/
│   ├── components/        # Editor components
│   │   ├── EditorLayout.tsx       # Main layout
│   │   ├── Toolbar.tsx            # Top toolbar
│   │   └── index.ts
│   ├── panels/            # Editor panels
│   │   ├── LayersPanel.tsx        # Element tree
│   │   ├── PropertiesPanel.tsx    # Style inspector
│   │   ├── AssetsPanel.tsx        # Media library
│   │   └── index.ts
│   ├── hooks/             # Editor hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Panel Descriptions:**

- **LayersPanel**: Element hierarchy tree view
- **PropertiesPanel**: Selected element style inspector
- **AssetsPanel**: Image/media library (Faz 1'de basit)
- **Toolbar**: Add element, undo/redo, zoom controls

### App: web

**Sorumluluk**: Ana uygulama, routing, orchestration

```
apps/web/
├── src/
│   ├── components/        # App-specific components
│   ├── pages/             # Pages (Home, Editor, etc.)
│   ├── styles/            # Global styles
│   │   └── index.css      # CSS reset, global styles
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite types
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.ts         # Vite config
├── package.json
└── tsconfig.json
```

---

## 🔄 State Management

### Store Architecture

#### Canvas Store
**Dosya**: `packages/core/src/store/canvas-store.ts`

**State Shape:**
```typescript
interface CanvasStore {
  // Data
  elements: Record<string, Element>;
  rootElementIds: string[];
  selectedElementIds: string[];
  hoveredElementId: string | null;
  
  // Actions
  addElement: (element, parentId?) => string;
  updateElement: (id, updates) => void;
  updateElementStyle: (id, style) => void;
  deleteElement: (id) => void;
  selectElement: (id, multiSelect?) => void;
  // ... more actions
}
```

**Kullanım:**
```typescript
// Component içinde
const { elements, addElement, selectElement } = useCanvasStore();

// Element ekle
const newId = addElement({ 
  type: 'container',
  style: { width: 200, height: 100 }
});

// Element seç
selectElement(newId);
```

**Neden Record<string, Element>?**
- O(1) lookup by ID
- Hızlı updates
- Memory efficient (Array yerine)

#### History Store
**Dosya**: `packages/core/src/store/history-store.ts`

**State Shape:**
```typescript
interface HistoryStore {
  past: CanvasState[];
  future: CanvasState[];
  
  addToHistory: (state) => void;
  undo: (getCurrentState, applyState) => void;
  redo: (getCurrentState, applyState) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
```

**Undo/Redo Workflow:**
```
1. User action (e.g., move element)
2. Before action: Save current state to history
3. Perform action: Update canvas store
4. Undo triggered: Pop from past, push to future, apply
```

**Örnek:**
```typescript
const saveHistory = () => {
  const currentState = {
    elements: useCanvasStore.getState().elements,
    rootElementIds: useCanvasStore.getState().rootElementIds,
    // ...
  };
  useHistoryStore.getState().addToHistory(currentState);
};

// Action öncesi history kaydet
saveHistory();
updateElementStyle(id, { width: 500 });
```

**Optimizations:**
- Max 50 history states (memory limit)
- Structural sharing with Immer (memory efficient)
- Future cleared on new action

### State Normalization

Element tree düz (flat) bir yapıda saklanır:

```typescript
// ❌ Nested (Kötü)
{
  id: 'parent',
  children: [
    { id: 'child1', ... },
    { id: 'child2', ... }
  ]
}

// ✅ Normalized (İyi)
elements: {
  'parent': { id: 'parent', children: ['child1', 'child2'] },
  'child1': { id: 'child1', parentId: 'parent' },
  'child2': { id: 'child2', parentId: 'parent' }
}
```

**Avantajları:**
- Herhangi bir element'i O(1)'de bul
- Update daha kolay (sadece o element'i güncelle)
- Circular reference yok
- Serialize etmek kolay

---

## 🌊 Veri Akışı

### Element Ekleme Flow
```
1. User clicks "Add Container"
   ↓
2. Toolbar component calls useCanvasStore.addElement()
   ↓
3. Store: Generate ID (nanoid)
   ↓
4. Store: Create element with defaults
   ↓
5. Store: Add to elements map
   ↓
6. Store: Add to parent's children or rootElementIds
   ↓
7. React: Re-render affected components
   ↓
8. Canvas: Render new element
```

### Element Update Flow
```
1. User drags element
   ↓
2. Canvas hook (useCanvasDrag) calculates new position
   ↓
3. Before update: Save history (optional, throttled)
   ↓
4. Call updateElementStyle(id, { left: x, top: y })
   ↓
5. Store: Update element.style with Immer
   ↓
6. React: Re-render element
   ↓
7. Canvas: Visual update (transform: translate)
```

### Undo/Redo Flow
```
1. User presses Ctrl+Z
   ↓
2. Keyboard hook calls useHistoryStore.undo()
   ↓
3. History store: Get previous state from past[]
   ↓
4. History store: Push current state to future[]
   ↓
5. Apply previous state to canvas store
   ↓
6. React: Re-render entire canvas
```

### Selection Flow
```
1. User clicks on element
   ↓
2. Canvas catches click event
   ↓
3. Find element ID from event target
   ↓
4. Call selectElement(id, multiSelect=false)
   ↓
5. Store: Update selectedElementIds
   ↓
6. React: Re-render selection UI
   ↓
7. Canvas: Show selection box & resize handles
   ↓
8. PropertiesPanel: Show selected element properties
```

---

## 🎯 Faz 1 Detayları

### Hedefler

**Ana Hedef**: Temel bir canvas editor oluşturmak. Kullanıcı box element'leri ekleyebilmeli, hareket ettirebilmeli, resize edebilmeli, ve temel stil değişiklikleri yapabilmeli.

### Deliverables

#### 1. Canvas Rendering ✅
- [ ] Canvas viewport
- [ ] Element rendering (container, text, button)
- [ ] Z-index layering
- [ ] Overflow handling

#### 2. Selection System ✅
- [ ] Click to select
- [ ] Multi-select (Shift+Click)
- [ ] Selection box highlight
- [ ] Deselect (click on empty area)

#### 3. Drag & Drop ✅
- [ ] Drag element to move
- [ ] Update position (left, top)
- [ ] Visual feedback during drag
- [ ] Bounds constraint (optional)

#### 4. Resize System ✅
- [ ] 8 resize handles (corners + sides)
- [ ] Maintain aspect ratio (Shift key)
- [ ] Min width/height
- [ ] Visual feedback

#### 5. Layers Panel ✅
- [ ] Tree view of elements
- [ ] Expand/collapse groups
- [ ] Click to select
- [ ] Drag to reorder (advanced)
- [ ] Rename element
- [ ] Lock/hide element

#### 6. Properties Panel ✅
- [ ] Show selected element properties
- [ ] Edit position (X, Y)
- [ ] Edit size (W, H)
- [ ] Edit background color
- [ ] Edit padding
- [ ] Edit border

#### 7. Toolbar ✅
- [ ] Add element buttons (Container, Text, Button)
- [ ] Undo/Redo buttons (with shortcuts)
- [ ] Delete selected (Del key)
- [ ] Duplicate selected (Ctrl+D)
- [ ] Zoom controls (future)

#### 8. Keyboard Shortcuts ✅
- [ ] Ctrl+Z: Undo
- [ ] Ctrl+Shift+Z: Redo
- [ ] Del: Delete selected
- [ ] Ctrl+D: Duplicate selected
- [ ] Ctrl+A: Select all (future)
- [ ] Arrow keys: Nudge element (future)

### MVP Scope

**Dahil:**
- Container element (div)
- Text element (p, h1-h6)
- Button element
- Absolute positioning (relative/fixed later)
- Basic styles (background, color, size, padding, margin)
- Single canvas (no pages yet)

**Dahil Değil (İleri Fazlar):**
- Flexbox/Grid (Faz 2)
- Responsive breakpoints (Faz 2)
- Shadows, gradients (Faz 3)
- Animations (Faz 5)
- Code export (Faz 6)
- Real-time collaboration (Faz 6)

### Haftalık Plan

#### Hafta 1-2: Canvas Foundation
- Canvas viewport component
- Element renderer (factory pattern)
- Basic styling system
- Simple element rendering

#### Hafta 3-4: Selection
- Click detection
- Multi-select logic
- Selection box UI
- Keyboard modifiers (Shift, Ctrl)

#### Hafta 5-6: Drag & Drop
- Mouse event handlers
- Position calculation
- Real-time position update
- Throttling for performance

#### Hafta 7-8: Resize
- Resize handle placement
- Resize direction detection
- Size calculation
- Aspect ratio locking

#### Hafta 9-10: Layers Panel
- Tree view component
- Element hierarchy rendering
- Expand/collapse state
- Inline rename

#### Hafta 11-12: Properties Panel
- Property inspector layout
- Input components (number, color)
- Two-way binding with store
- Real-time updates

#### Hafta 13-14: Toolbar & Shortcuts
- Toolbar component
- Add element buttons
- Undo/Redo UI
- Keyboard event handlers

#### Hafta 15-16: Polish & Testing
- Bug fixes
- Performance optimization
- UX improvements
- Basic tests (unit + integration)

---

## 🚀 Kurulum ve Çalıştırma

### Sistem Gereksinimleri

- **OS**: Linux (Ubuntu 20.04+, Mint, Debian), macOS 12+, Windows 10+ (WSL2)
- **Node.js**: >= 18.0.0 (LTS önerilen)
- **RAM**: 4GB minimum, 8GB+ önerilen
- **Disk**: 2GB boş alan (node_modules için)

### Kurulum

#### 1. Script ile Otomatik Kurulum (Önerilen)

```bash
# Script'i çalıştırılabilir yap
chmod +x setup-phase1.sh

# Kurulumu başlat
./setup-phase1.sh

# Proje klasörüne gir
cd website-builder

# Dependencies zaten yüklenmiş olmalı, yoksa:
pnpm install
```

#### 2. Manuel Kurulum

```bash
# Repo'yu clone edin (veya zip indirin)
git clone <repo-url>
cd website-builder

# pnpm yükleyin (yoksa)
npm install -g pnpm

# Dependencies'leri yükleyin
pnpm install
```

### Development

```bash
# Tüm package'ları dev mode'da çalıştır
pnpm dev

# Tarayıcıda otomatik açılır: http://localhost:3000
```

**Ne Olur?**
- Vite dev server başlar
- Hot Module Replacement (HMR) aktif olur
- TypeScript type checking çalışır
- Turborepo tüm package'ları parallel çalıştırır

### Build

```bash
# Production build
pnpm build

# Build output: apps/web/dist/
```

### Type Checking

```bash
# Tüm package'ları type-check et
pnpm type-check
```

### Temizlik

```bash
# node_modules, dist, build klasörlerini sil
pnpm clean

# Sonra tekrar install
pnpm install
```

---

## 🛠️ Geliştirme Kılavuzu

### Yeni Element Type Ekleme

#### 1. Type Tanımlama
**Dosya**: `packages/core/src/types/element.ts`

```typescript
// Yeni type ekle
export type ElementType = 
  | 'container' 
  | 'text'
  | 'image'
  | 'video';  // ← YENİ

// Interface tanımla
export interface VideoElement extends BaseElement {
  type: 'video';
  props: {
    src: string;
    autoplay?: boolean;
    loop?: boolean;
  };
}

// Union'a ekle
export type Element = 
  | ContainerElement 
  | TextElement 
  | VideoElement;  // ← YENİ
```

#### 2. Default Element Oluştur
**Dosya**: `packages/core/src/store/canvas-store.ts`

```typescript
const createDefaultElement = (type: ElementType) => {
  const defaults = {
    // ... existing
    video: {
      type: 'video',
      name: 'Video',
      style: {
        position: 'absolute',
        width: 640,
        height: 360,
      },
      props: {
        src: '',
        autoplay: false,
      },
    },
  };
  return defaults[type];
};
```

#### 3. Renderer Oluştur
**Dosya**: `packages/canvas/src/components/renderers/VideoRenderer.tsx`

```typescript
interface Props {
  element: VideoElement;
  isSelected: boolean;
  onSelect: () => void;
}

export const VideoRenderer = ({ element, isSelected, onSelect }: Props) => {
  return (
    <div
      style={styleToCss(element.style)}
      onClick={onSelect}
      className={isSelected ? 'selected' : ''}
    >
      <video
        src={element.props.src}
        autoPlay={element.props.autoplay}
        loop={element.props.loop}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
```

#### 4. Renderer'ı Ekle
**Dosya**: `packages/canvas/src/components/ElementRenderer.tsx`

```typescript
const renderers = {
  container: ContainerRenderer,
  text: TextRenderer,
  video: VideoRenderer,  // ← YENİ
};
```

#### 5. Toolbar'a Ekle
**Dosya**: `packages/editor/src/components/Toolbar.tsx`

```tsx
<button onClick={() => addElement({ type: 'video' })}>
  <VideoIcon /> Add Video
</button>
```

### Yeni Style Property Ekleme

#### 1. Type'a Ekle
```typescript
// packages/core/src/types/element.ts
export interface StyleProperties {
  // ... existing
  boxShadow?: string;      // ← YENİ
  textShadow?: string;     // ← YENİ
  filter?: string;         // ← YENİ
}
```

#### 2. Properties Panel'e Ekle
```tsx
// packages/editor/src/panels/PropertiesPanel.tsx
<StyleInput
  label="Box Shadow"
  value={element.style.boxShadow}
  onChange={(val) => updateElementStyle(element.id, { boxShadow: val })}
/>
```

### Yeni Keyboard Shortcut Ekleme

```typescript
// packages/editor/src/hooks/useKeyboardShortcuts.ts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+B: Bold (future)
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      toggleBold();
    }
    
    // Ctrl+G: Group (future)
    if (e.ctrlKey && e.key === 'g') {
      e.preventDefault();
      groupSelected();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Testing

```bash
# Unit tests (ileride)
pnpm test

# E2E tests (ileride)
pnpm test:e2e
```

**Test Strategy (İleride):**
- Unit tests: Store actions, utils
- Integration tests: Component interactions
- E2E tests: Full user workflows

### Code Style

**ESLint + Prettier (ileride kurulacak)**

```bash
# Lint
pnpm lint

# Format
pnpm format
```

**Conventions:**
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Utils: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case

---

## 🔮 İleri Fazlar

### Faz 2: Layout Sistemi (3-4 ay)
- Flexbox properties
- Grid properties
- Auto-layout (Figma-style)
- Constraints (resizing behavior)
- Responsive breakpoints
- Device preview

### Faz 3: Tasarım Detayları (4-5 ay)
- Advanced border (per-corner radius)
- Box shadow (multiple shadows)
- Gradients (linear, radial)
- Blend modes
- Filters (blur, brightness)
- Typography (kerning, leading)
- Design tokens (colors, typography)

### Faz 4: Component Sistemi (3-4 ay)
- Master components
- Component instances
- Overrides
- Variants (states)
- Props system
- Component library
- Marketplace (ileride)

### Faz 5: Interactions & Data (4-5 ay)
- Timeline animator
- Transition presets
- Scroll animations
- Hover/click interactions
- Form builder
- CMS integration (Strapi, Contentful)
- API bindings

### Faz 6: Export & Collaboration (3-4 ay)
- React code export
- Next.js template
- Hosting platform
- Real-time collaboration (WebSockets)
- Comments
- Version history
- Team management

### Faz 7: Advanced Features (ongoing)
- Plugins API
- Custom code blocks
- A/B testing
- Analytics
- SEO tools
- Performance insights
- AI-powered features

---

## 📊 Metrikler ve Hedefler

### Performance Targets

- **Initial Load**: < 2 saniye
- **Time to Interactive**: < 3 saniye
- **FPS**: 60 FPS smooth interactions
- **Max Elements**: 5000+ elements support
- **Undo/Redo**: < 50ms response

### Bundle Size Targets

- **Initial Bundle**: < 200 KB (gzipped)
- **Total Assets**: < 1 MB (first load)
- **Lazy Loaded**: < 50 KB per route

### Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

---

## 🤝 Katkıda Bulunma

### Workflow

1. Issue aç (bug veya feature request)
2. Branch oluştur (`feature/my-feature` veya `fix/my-bug`)
3. Commit yap (conventional commits)
4. Push yap
5. Pull Request aç

### Commit Messages

```
feat: add video element support
fix: selection bug on nested elements
refactor: optimize element rendering
docs: update README
test: add canvas store tests
chore: update dependencies
```

### Code Review Checklist

- [ ] TypeScript errors yok
- [ ] Linting errors yok
- [ ] Tests pass (ileride)
- [ ] Performance regression yok
- [ ] Documentation updated

---

## 📝 Notlar

### Bilinen Limitasyonlar (Faz 1)

- Sadece absolute positioning
- Tek sayfa (multi-page yok)
- Export yok
- Collaboration yok
- Responsive yok

### Gelecek İyileştirmeler

- Service Worker (offline support)
- IndexedDB (auto-save)
- WebAssembly (heavy computations)
- Web Workers (background tasks)

### İletişim

- GitHub Issues: Bug reports, feature requests
- Discussions: Genel sorular, öneriler
- Email: [email korunmuş]

---

## 📚 Kaynaklar

### Öğrenme Materyalleri

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Vite Guide](https://vitejs.dev/guide)

### Inspirasyon

- [Figma](https://figma.com) - Tasarım araçları
- [Webflow](https://webflow.com) - Visual builder UX
- [Framer](https://framer.com) - Component yaklaşımı
- [Builder.io](https://builder.io) - Headless CMS

### Benzer Projekte

- [GrapesJS](https://grapesjs.com) - Open-source web builder
- [Craft.js](https://craft.js.org) - React page builder framework

---

## 🎯 Mevcut Proje Durumu (Aralık 2024)

### ✅ Tamamlanan Özellikler

#### 1. Prebuilt Template Sistemi
NextCommerce temasından adapte edilmiş hazır şablonlar oluşturuldu:

| Şablon | Dosya | Açıklama |
|--------|-------|----------|
| **Announcement Bar (TopBar)** | `nextcommerce-announcement-bar.json` | Üst bilgilendirme çubuğu - özel teklifler, duyurular |
| **Header** | `nextcommerce-header.json` | Logo, navigasyon, arama ve sepet ikonları içeren başlık |
| **Hero Slider** | `nextcommerce-hero.json` | 3 slaytlı, auto-play ve navigasyon destekli slider |

**Şablon Konumu**: `packages/core/src/templates/prebuilt/`

#### 2. Yeni Element Tipleri

##### Icon Element
- **Tip**: `icon`
- **Özellikler**: `iconName`, `strokeWidth`, `size`, `color`
- **Desteklenen İkonlar**: search, user, heart, shopping-bag, menu, close, chevron-left, chevron-right, plus, minus, star
- **Renderer**: `packages/canvas/src/components/renderers/IconRenderer.tsx`

##### Slider Element
- **Tip**: `slider`
- **Özellikler**: 
  - `slides[]` - SlideData array (backgroundImage, backgroundColor, label, title, description, buttons)
  - `autoPlay` - Otomatik geçiş
  - `interval` - Geçiş süresi (ms)
  - `showArrows` - Navigasyon okları
  - `showDots` - Sayfa noktaları
- **Renderer**: `packages/canvas/src/components/renderers/SliderRenderer.tsx`

#### 3. Slide Editor Modal
Slider elementlerinin içeriğini düzenlemek için tam ekran modal editör:

- **Konum**: `packages/editor/src/components/SlideEditorModal.tsx`
- **Özellikler**:
  - Sol panel: Slayt listesi ve küçük önizlemeler
  - Sağ panel: Aktif slayt düzenleme formu
  - Arkaplan görseli/rengi düzenleme
  - Etiket, başlık, alt başlık, açıklama düzenleme
  - Buton ekleme/silme (Primary/Outline varyantları)
  - Yeni slayt ekleme / mevcut slayt silme

#### 4. Properties Panel Geliştirmeleri
- Slider elementleri için özel kontrol paneli
- "Slaytları Düzenle" butonu ile modal açma
- Auto-play, süre, ok/nokta gösterimi ayarları

### 📁 Export Paketi
Hazır şablonlar `/exports/nextcommerce-templates.zip` dosyasında dışa aktarıldı:
- `nextcommerce-announcement-bar.json`
- `nextcommerce-header.json`
- `nextcommerce-hero.json`
- `index.ts` (export tanımları)

### 🔧 Teknik Güncellemeler

#### ContainerRenderer Düzeltmeleri
- Background style uygulaması düzeltildi (undefined değerler filtreleniyor)
- Flex properties conditional spread pattern ile güncellendi

#### SliderRenderer CSS Düzeltmeleri
- Content padding: `32px 24px` (orijinal tasarıma uyum)
- Overlay gradient: `linear-gradient(to right, rgba(26,26,46,0.85), rgba(26,26,46,0.4) 50%, transparent)`

#### Code Generator Güncellemeleri
- Icon elementi için HTML ve React kod üretimi eklendi
- generateIconSVG helper fonksiyonu oluşturuldu

### 📋 Sonraki Adımlar

1. **Slider Code Generation**: Export için slider JavaScript dahil etme
2. **Drag-Drop Reorder**: Slide'ları sürükle-bırak ile yeniden sıralama
3. **Image Upload**: Arkaplan görseli için dosya yükleme
4. **Undo/Redo**: Slide editor'de geri alma desteği

---

**Son Güncelleme**: 27 Aralık 2024
**Versiyon**: 0.2.0 (Template System + Slider Editor)
**Lisans**: MIT
