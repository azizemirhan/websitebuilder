# Website Builder - Şablon ve Tasarım Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Şablon Yapısı (TemplateKit)](#şablon-yapısı)
3. [Şablon Oluşturma Yöntemleri](#şablon-oluşturma-yöntemleri)
4. [JSON Format Referansı](#json-format-referansı)
5. [Element Tipleri](#element-tipleri)
6. [Stil Özellikleri](#stil-özellikleri)

---

## Genel Bakış

Website Builder'da şablonlar, tekrar kullanılabilir sayfa bölümlerinden oluşur. Her şablon bir `TemplateKit` olarak saklanır ve içinde birden fazla `TemplateSection` barındırabilir.

**Şablon Akışı:**

1. JSON dosyası olarak şablon oluşturulur
2. "Şablonlar" panelinden "Yükle" butonuyla import edilir
3. İstenen bölümler (section) canvas'a "Ekle" butonuyla eklenir

---

## Şablon Yapısı

### TemplateKit (Ana Şablon)

```typescript
interface TemplateKit {
  id: string; // Benzersiz ID (ör: "tpl_my_template")
  name: string; // Görünen isim
  description?: string; // Açıklama
  version: string; // Sürüm (ör: "1.0.0")
  author?: string; // Yazar
  category: TemplateCategory; // Kategori
  tags?: string[]; // Etiketler
  thumbnail?: string; // Önizleme görseli URL
  createdAt: string; // ISO tarih
  updatedAt: string; // ISO tarih
  sections: TemplateSection[]; // Bölümler
}
```

### Kategoriler

| Değer       | Açıklama     |
| ----------- | ------------ |
| `ecommerce` | E-ticaret    |
| `landing`   | Landing Page |
| `portfolio` | Portfolyo    |
| `blog`      | Blog         |
| `business`  | Kurumsal     |
| `agency`    | Ajans        |
| `saas`      | SaaS Ürün    |
| `other`     | Diğer        |

### TemplateSection (Bölüm)

```typescript
interface TemplateSection {
  id: string; // Benzersiz bölüm ID
  name: string; // Görünen isim (ör: "Hero Slider")
  description?: string;
  thumbnail?: string;
  sectionType: SectionType; // Bölüm tipi
  elements: Record<string, Element>; // Tüm elementler (ID -> Element)
  rootElementIds: string[]; // Kök element ID'leri
}
```

### Bölüm Tipleri (SectionType)

| Değer          | Açıklama           |
| -------------- | ------------------ |
| `header`       | Sayfa başlığı/menü |
| `hero`         | Ana banner/slider  |
| `features`     | Özellikler bölümü  |
| `testimonials` | Müşteri yorumları  |
| `pricing`      | Fiyatlandırma      |
| `cta`          | Aksiyon çağrısı    |
| `footer`       | Sayfa altı         |
| `gallery`      | Galeri             |
| `contact`      | İletişim formu     |
| `about`        | Hakkımızda         |
| `team`         | Ekip               |
| `faq`          | SSS                |
| `blog`         | Blog listesi       |
| `products`     | Ürün listesi       |
| `custom`       | Özel               |

---

## Şablon Oluşturma Yöntemleri

### Yöntem 1: Editörden Export (Önerilen)

1. Canvas'ta tasarımınızı yapın
2. İstediğiniz bölümleri seçin
3. "Dışa Aktar" → "JSON olarak kaydet" seçin
4. Dosyayı düzenleyerek metadata ekleyin

### Yöntem 2: Manuel JSON Oluşturma

Aşağıdaki template yapısını kullanarak JSON dosyası oluşturun:

```json
{
  "id": "tpl_my_landing_page",
  "name": "Benim Landing Sayfam",
  "description": "Modern landing page şablonu",
  "version": "1.0.0",
  "author": "Aziz",
  "category": "landing",
  "tags": ["modern", "minimal"],
  "createdAt": "2024-12-30T12:00:00.000Z",
  "updatedAt": "2024-12-30T12:00:00.000Z",
  "sections": [
    {
      "id": "sec_hero_1",
      "name": "Hero Banner",
      "sectionType": "hero",
      "elements": { ... },
      "rootElementIds": ["el_root_1"]
    }
  ]
}
```

### Yöntem 3: Prebuilt Şablon Ekleme (Geliştirici)

1. `packages/core/src/templates/prebuilt/` klasörüne JSON dosyası ekleyin
2. `index.ts` dosyasını güncelleyin:

```typescript
import myTemplateJson from "./my-template.json";
export const myTemplate = myTemplateJson as unknown as TemplateKit;

export const prebuiltTemplates: TemplateKit[] = [
  myTemplate,
  // diğer şablonlar...
];
```

---

## JSON Format Referansı

### Tam Örnek

```json
{
  "id": "tpl_simple_hero",
  "name": "Basit Hero",
  "version": "1.0.0",
  "category": "landing",
  "createdAt": "2024-12-30T00:00:00.000Z",
  "updatedAt": "2024-12-30T00:00:00.000Z",
  "sections": [
    {
      "id": "sec_hero",
      "name": "Hero Section",
      "sectionType": "hero",
      "rootElementIds": ["hero_container"],
      "elements": {
        "hero_container": {
          "id": "hero_container",
          "type": "container",
          "name": "Hero Container",
          "children": ["hero_title", "hero_button"],
          "style": {
            "width": "100%",
            "minHeight": 600,
            "display": "flex",
            "flexDirection": "column",
            "justifyContent": "center",
            "alignItems": "center",
            "backgroundColor": "#1a1a2e",
            "padding": 40
          },
          "props": {
            "tag": "section"
          }
        },
        "hero_title": {
          "id": "hero_title",
          "type": "text",
          "name": "Hero Title",
          "children": [],
          "style": {
            "fontSize": 48,
            "fontWeight": 700,
            "color": "#ffffff",
            "textAlign": "center"
          },
          "props": {
            "content": "Hoş Geldiniz",
            "tag": "h1"
          }
        },
        "hero_button": {
          "id": "hero_button",
          "type": "button",
          "name": "CTA Button",
          "children": [],
          "style": {
            "padding": "16px 32px",
            "backgroundColor": "#e94560",
            "color": "#ffffff",
            "borderRadius": 8,
            "marginTop": 24
          },
          "props": {
            "text": "Hemen Başla"
          }
        }
      }
    }
  ]
}
```

---

## Element Tipleri

### container

**Açıklama:** Flex/Grid kutu elementi. Diğer elementleri içerir.

```json
{
  "type": "container",
  "props": {
    "tag": "div" | "section" | "article" | "header" | "footer" | "nav",
    "containerType": "flex" | "grid",
    "direction": "row" | "column",
    "justifyContent": "flex-start" | "center" | "flex-end" | "space-between",
    "alignItems": "flex-start" | "center" | "flex-end" | "stretch",
    "gap": 16,
    "widthMode": "auto" | "full" | "boxed",
    "maxWidth": 1200
  }
}
```

### text

**Açıklama:** Yazı elementi.

```json
{
  "type": "text",
  "props": {
    "content": "Metin içeriği (HTML destekler)",
    "tag": "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span"
  }
}
```

### button

**Açıklama:** Buton elementi.

```json
{
  "type": "button",
  "props": {
    "text": "Buton Metni",
    "variant": "primary" | "secondary" | "outline"
  }
}
```

### image

**Açıklama:** Görsel elementi.

```json
{
  "type": "image",
  "props": {
    "src": "https://example.com/image.jpg",
    "alt": "Görsel açıklaması",
    "objectFit": "cover" | "contain" | "fill"
  }
}
```

### icon

**Açıklama:** SVG ikon elementi.

```json
{
  "type": "icon",
  "props": {
    "iconName": "search" | "user" | "heart" | "cart" | "menu" | "close" | "plus" | "check" | "arrow-left" | "arrow-right" | "star" | "truck" | "shield-check" | "headphones",
    "strokeWidth": 2
  }
}
```

### menu

**Açıklama:** CMS menü elementi.

```json
{
  "type": "menu",
  "props": {
    "menuId": 1,
    "layout": "horizontal" | "vertical",
    "dropdownOpenAs": "hover" | "click",
    "showSubmenuIndicator": true,
    "megaMenuBindings": { "menu_item_id": "container_element_id" },
    "megaMenuPosition": "below" | "full-width"
  }
}
```

### slider

**Açıklama:** Slider/Carousel elementi.

```json
{
  "type": "slider",
  "props": {
    "autoPlay": true,
    "interval": 6000,
    "showDots": true,
    "showArrows": true,
    "slides": [
      {
        "id": "slide_1",
        "title": "Başlık",
        "titleHighlight": "Vurgulu Kısım",
        "description": "Açıklama metni",
        "label": "YENİ",
        "backgroundImage": "https://example.com/bg.jpg",
        "backgroundColor": "#1a1a2e",
        "buttons": [{ "text": "Buton", "variant": "primary", "link": "/sayfa" }]
      }
    ]
  }
}
```

### input

**Açıklama:** Form input elementi.

```json
{
  "type": "input",
  "props": {
    "inputType": "text" | "email" | "password" | "number",
    "placeholder": "Placeholder text",
    "value": ""
  }
}
```

---

## Stil Özellikleri

Tüm elementler `style` objesi içerebilir:

### Boyut & Pozisyon

```json
{
  "width": "100%" | 500,
  "height": "auto" | 300,
  "minWidth": 200,
  "maxWidth": 1200,
  "minHeight": 100,
  "maxHeight": 800,
  "position": "relative" | "absolute" | "fixed",
  "top": 0,
  "left": 0,
  "right": 0,
  "bottom": 0,
  "zIndex": 100
}
```

### Spacing

```json
{
  "padding": 16,
  "paddingTop": 24,
  "paddingRight": 16,
  "paddingBottom": 24,
  "paddingLeft": 16,
  "margin": 0,
  "marginTop": 32,
  "gap": 16
}
```

### Typography

```json
{
  "fontSize": 16,
  "fontWeight": 400 | 500 | 600 | 700,
  "fontFamily": "'Inter', sans-serif",
  "lineHeight": 1.5,
  "letterSpacing": 0,
  "textAlign": "left" | "center" | "right",
  "textDecoration": "none" | "underline",
  "textTransform": "none" | "uppercase" | "lowercase",
  "color": "#000000"
}
```

### Background

```json
{
  "backgroundColor": "#ffffff",
  "background": "linear-gradient(to right, #1a1a2e, #2d2d44)",
  "backgroundImage": "url(/path/to/image.jpg)",
  "backgroundSize": "cover" | "contain",
  "backgroundPosition": "center",
  "backgroundRepeat": "no-repeat"
}
```

### Border

```json
{
  "border": "1px solid #e5e7eb",
  "borderWidth": 1,
  "borderColor": "#e5e7eb",
  "borderStyle": "solid" | "dashed" | "dotted",
  "borderRadius": 8,
  "borderTopLeftRadius": 8
}
```

### Effects

```json
{
  "opacity": 1,
  "boxShadow": "0 4px 6px rgba(0,0,0,0.1)",
  "transform": "translateY(-10px)",
  "transition": "all 0.3s ease"
}
```

### Flexbox

```json
{
  "display": "flex",
  "flexDirection": "row" | "column",
  "justifyContent": "flex-start" | "center" | "flex-end" | "space-between" | "space-around",
  "alignItems": "flex-start" | "center" | "flex-end" | "stretch",
  "flexWrap": "nowrap" | "wrap",
  "gap": 16
}
```

### Grid

```json
{
  "display": "grid",
  "gridTemplateColumns": "repeat(3, 1fr)",
  "gridTemplateRows": "auto",
  "gridGap": 24,
  "gridColumn": "1 / 3",
  "gridRow": "1 / 2"
}
```

---

## 💡 İpuçları

1. **ID'ler benzersiz olmalı** - Her element için unique ID kullanın
2. **Children array'i doğru sırayla** - Parent elementte children ID'leri sırayla yazın
3. **rootElementIds** - Sadece en üst seviye container ID'lerini içermeli
4. **Responsive tasarım** - `responsiveStyles` objesi ile breakpoint bazlı stiller ekleyebilirsiniz
5. **Tema renkleri** - Hardcoded renkler yerine CSS değişkenleri kullanmayı düşünün

---

## 📁 Dosya Yapısı

```
packages/core/src/templates/
├── prebuilt/
│   ├── index.ts          # Tüm prebuilt şablonları export eder
│   └── my-template.json  # Şablon JSON dosyaları
├── template-kit.ts       # TemplateKit interface tanımları
└── template-converter.ts # HTML -> Template dönüştürücü
```

---

_Bu dokümantasyon Website Builder v1.0 için hazırlanmıştır._
