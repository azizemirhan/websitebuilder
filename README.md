# 🎨 Website Builder - Professional React-based Website Builder

Figma seviyesinde tasarım detaylarına sahip, modern ve profesyonel bir website builder.

## 📋 Proje Hakkında

Bu proje, kullanıcıların kod yazmadan profesyonel web siteleri oluşturabilmesini sağlayan, React tabanlı bir visual website builder'dır. Webflow, Framer gibi piyasadaki profesyonel araçlarla rekabet edebilecek düzeyde tasarlanmıştır.

### Temel Özellikler

- **Visual Canvas Editor**: Sürükle-bırak ile element ekleme ve düzenleme
- **Figma-level Design Tools**: Detaylı stil kontrolleri (border radius, shadows, gradients, vb.)
- **Component System**: Yeniden kullanılabilir component'ler
- **Responsive Design**: Breakpoint-based responsive tasarım
- **Undo/Redo**: Sınırsız geri alma/ileri alma
- **Real-time Preview**: Anlık önizleme
- **Code Export**: Temiz React kodu export

## 🏗️ Mimari

### Monorepo Yapısı

Proje, modülerlik ve ölçeklenebilirlik için monorepo mimarisi kullanır:

```
website-builder/
├── packages/
│   ├── core/        # Temel types, state management, utilities
│   ├── canvas/      # Canvas render engine
│   └── editor/      # Editor UI ve panels
└── apps/
    └── web/         # Ana web uygulaması
```

### Teknoloji Stack

#### Frontend

- **React 18+**: UI library, concurrent features
- **TypeScript**: Type safety, better DX
- **Vite**: Hızlı development build tool
- **Zustand**: Lightweight state management
- **Immer**: Immutable state updates

#### State Management

- **Canvas Store**: Element'lerin state yönetimi
- **History Store**: Undo/Redo functionality
- **Intermediate Representation**: JSON-based element tree

#### Build & Dev Tools

- **Turborepo**: Monorepo task running
- **pnpm**: Hızlı ve disk-efficient package manager
- **ESLint + Prettier**: Code quality

### Veri Modeli

#### Element Structure

```typescript
interface Element {
  id: string;
  type: ElementType;
  name: string;
  style: StyleProperties;
  children: string[];
  parentId: string | null;
  props: Record<string, any>;
}
```

#### State Architecture

```
User Action → Store Action → Immer Update → React Re-render
                    ↓
              History Store (Undo/Redo)
```

## 📦 Package'lar

### @builder/core

Temel types, interfaces, state management ve utility fonksiyonlar.

**Sorumluluklar:**

- Element type definitions
- Canvas state management (Zustand)
- History management (Undo/Redo)
- Element helper functions

**Key Files:**

- `types/element.ts`: Element type tanımları
- `store/canvas-store.ts`: Canvas state
- `store/history-store.ts`: Undo/Redo state
- `utils/element-helpers.ts`: Helper functions

### @builder/canvas

Canvas rendering engine ve element render logic.

**Sorumluluklar:**

- Element rendering
- Canvas interactions (drag, resize, select)
- Visual feedback
- Canvas viewport management

**Faz 1'de Eklenecek:**

- CanvasRenderer component
- Element renderers
- Interaction handlers

### @builder/editor

Editor UI, panels ve toolbars.

**Sorumluluklar:**

- Editor layout
- Layers panel
- Properties panel
- Toolbar
- Keyboard shortcuts

**Faz 1'de Eklenecek:**

- Editor layout
- Layers panel (element tree)
- Properties inspector
- Toolbar (add element, undo/redo)

### web (app)

Ana web uygulaması, tüm package'ları bir araya getirir.

## 🚀 Kurulum

### Gereksinimler

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Adımlar

1. **Script'i çalıştırılabilir yap:**

```bash
chmod +x setup-phase1.sh
```

2. **Setup script'ini çalıştır:**

```bash
./setup-phase1.sh
```

3. **Dependencies'i yükle:**

```bash
cd website-builder
pnpm install
```

4. **Development server'ı başlat:**

```bash
pnpm dev
```

Uygulama http://localhost:3000 adresinde açılacaktır.

## 📅 Roadmap

### ✅ Faz 1: Temel Canvas ve Editor (3-4 ay)

**Hedefler:**

- ✅ Monorepo setup
- ✅ Temel type definitions
- ✅ Canvas state management
- ✅ Undo/Redo sistem
- 🚧 Canvas renderer
- 🚧 Basit element rendering (box model)
- 🚧 Element selection
- 🚧 Drag & drop (position change)
- 🚧 Resize handles
- 🚧 Layers panel
- 🚧 Properties inspector
- 🚧 Toolbar (add element, delete, duplicate)

**Çıktılar:**

- Basit box'lar ekleme, taşıma, resize
- Element seçme ve temel stil değişiklikleri
- Undo/Redo çalışıyor
- Layer hierarchy görünümü

### 📋 Faz 2: Layout Sistemi (3-4 ay)

- Flexbox support
- Grid support
- Auto-layout
- Constraints
- Responsive breakpoints
- Nested components

### 📋 Faz 3: Tasarım Detayları (4-5 ay)

- Advanced border controls
- Shadows & gradients
- Blend modes
- Typography controls
- Color picker
- Design tokens

### 📋 Faz 4: Component Sistemi (3-4 ay)

- Master components
- Component variants
- Props system
- Component library
- Marketplace

### 📋 Faz 5: Interactions & Data (4-5 ay)

- Animations
- Scroll effects
- CMS integration
- Form builder
- API connections

### 📋 Faz 6: Export & Collaboration (3-4 ay)

- React code export
- Hosting
- Real-time collaboration
- Version history
- SEO tools

## 🎯 Faz 1 Detaylı Görevler

### Week 1-2: Canvas Rendering

- [ ] CanvasRenderer component
- [ ] Element rendering logic
- [ ] Canvas viewport (zoom, pan)
- [ ] Grid/ruler overlay

### Week 3-4: Selection System

- [ ] Click selection
- [ ] Multi-select (Shift+Click)
- [ ] Selection box (drag selection)
- [ ] Selection highlight

### Week 5-6: Drag & Drop

- [ ] Position change on drag
- [ ] Snap to grid (optional)
- [ ] Visual feedback during drag
- [ ] Constraint to canvas bounds

### Week 7-8: Resize System

- [ ] Resize handles (8 directions)
- [ ] Maintain aspect ratio (Shift)
- [ ] Min/max constraints
- [ ] Visual feedback

### Week 9-10: Layers Panel

- [ ] Element tree view
- [ ] Expand/collapse
- [ ] Rename elements
- [ ] Drag to reorder
- [ ] Lock/hide elements

### Week 11-12: Properties Panel

- [ ] Style inspector
- [ ] Position controls (X, Y, W, H)
- [ ] Spacing controls (padding, margin)
- [ ] Color picker
- [ ] Typography controls

### Week 13-14: Toolbar & Polish

- [ ] Add element buttons
- [ ] Undo/Redo buttons
- [ ] Keyboard shortcuts
- [ ] Delete selected
- [ ] Duplicate selected

### Week 15-16: Testing & Refinement

- [ ] Bug fixes
- [ ] Performance optimization
- [ ] UX improvements
- [ ] Documentation

## 🛠️ Development Komutları

```bash
# Tüm package'ları dev mode'da çalıştır
pnpm dev

# Type checking
pnpm type-check

# Build all packages
pnpm build

# Temizlik
pnpm clean

# Sadece belirli bir package'ı çalıştır
cd packages/core && pnpm dev
```

## 📖 Kod Standartları

### Naming Conventions

- **Components**: PascalCase (`CanvasRenderer.tsx`)
- **Utilities**: camelCase (`elementHelpers.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HISTORY`)
- **Interfaces**: PascalCase with `I` prefix optional (`Element` or `IElement`)

### File Organization

```
component/
├── ComponentName.tsx       # Main component
├── ComponentName.module.css # Styles (if needed)
├── useComponentName.ts     # Custom hook (if needed)
└── index.ts               # Re-export
```

### Commit Messages

```
feat: add canvas renderer
fix: selection bug on nested elements
refactor: optimize element rendering
docs: update README
```

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Lisans

MIT License - detaylar için LICENSE dosyasına bakın.

## 🙏 Teşekkürler

Bu proje şu harika araçlardan ilham almıştır:

- [Figma](https://figma.com) - Tasarım detayları
- [Webflow](https://webflow.com) - Visual builder UX
- [Framer](https://framer.com) - Component yaklaşımı

---

**Not**: Bu README, proje geliştikçe güncellenecektir.

şimdi bu builder'ı bir e-ticaret altyapısına entegre edeceğim ve bu eticaret altyapısında halihazırda bir page, page section ve menu, menu-item gibi bir sistem var şimdi bunu yine laravel api ile entegre edeceğiz ama demo olacak yani önce bu sisteme benzer bir api oluşturacağız buradaki e-ticaret sistemi içinde api oluşturabilirsin şimd e-ticaret proje klasörünün kopyasını oluşturacağım sen bunun inceleyip bir laravel api projesi oluştur
