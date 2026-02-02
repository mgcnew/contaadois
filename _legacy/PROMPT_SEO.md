# Prompt de Engenharia para SEO Completo (Pós-Refatoração React)

## Sua Função
Você é um Especialista em SEO Técnico e Performance Web. Sua missão é implementar uma estratégia completa de SEO na aplicação React/Next.js que foi refatorada a partir do código HTML original.

## Pré-requisito
Este prompt deve ser usado **APÓS** a refatoração do código HTML para React (usando o PROMPT_REFATORACAO.md). A aplicação já deve estar funcionando em React + TypeScript + Vite ou Next.js.

---

## 📋 1. Meta Tags e Head

### Tags Essenciais:
- `<title>` — Título único por página (50-60 caracteres)
- `<meta name="description">` — Descrição única por página (150-160 caracteres)
- `<meta name="viewport">` — Responsividade mobile
- `<link rel="canonical">` — URL canônica para evitar conteúdo duplicado
- `<meta name="robots">` — Indexação controlada

### Open Graph (Facebook/LinkedIn):
```html
<meta property="og:title" content="Título da Página" />
<meta property="og:description" content="Descrição atrativa" />
<meta property="og:image" content="https://seusite.com/og-image.jpg" />
<meta property="og:url" content="https://seusite.com/pagina" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nome do Site" />
```

### Twitter Cards:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Título" />
<meta name="twitter:description" content="Descrição" />
<meta name="twitter:image" content="https://seusite.com/twitter-image.jpg" />
```

### Favicon e App Icons:
- `favicon.ico` (32x32)
- `apple-touch-icon.png` (180x180)
- `manifest.json` para PWA

---

## 📋 2. Schema.org / Dados Estruturados (JSON-LD)

Implementar JSON-LD no `<head>` de cada página relevante:

### Para Landing Pages / Sites Institucionais:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nome da Empresa",
  "url": "https://seusite.com",
  "logo": "https://seusite.com/logo.png",
  "sameAs": ["https://facebook.com/...", "https://instagram.com/..."],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-...",
    "contactType": "customer service"
  }
}
```

### Para Páginas de Produto/Serviço:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nome do Produto",
  "description": "Descrição",
  "offers": {
    "@type": "Offer",
    "price": "99.90",
    "priceCurrency": "BRL"
  }
}
```

### Para FAQ:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Pergunta aqui?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Resposta aqui."
      }
    }
  ]
}
```

---

## 📋 3. Sitemap e Robots.txt

### sitemap.xml:
Gerar automaticamente um sitemap com todas as páginas públicas:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seusite.com/</loc>
    <lastmod>2025-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### robots.txt:
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://seusite.com/sitemap.xml
```

---

## 📋 4. Performance e Core Web Vitals

### Imagens:
- Usar `next/image` (Next.js) ou lazy loading nativo (`loading="lazy"`)
- Formatos modernos: WebP ou AVIF
- Definir `width` e `height` para evitar CLS (Cumulative Layout Shift)
- Comprimir imagens (máx 200KB para hero, 100KB para thumbnails)

### Fontes:
- Usar `next/font` ou `font-display: swap` para evitar FOIT
- Precarregar fontes críticas: `<link rel="preload" as="font">`
- Limitar a 2-3 famílias de fontes

### JavaScript:
- Code splitting por rota (já nativo no Next.js)
- Lazy load de componentes pesados: `React.lazy()` + `Suspense`
- Remover dependências não utilizadas

### CSS:
- Purgar CSS não utilizado (Tailwind já faz isso em produção)
- Inline CSS crítico (above-the-fold)
- Evitar `@import` em CSS (usar `<link>` em vez disso)

### Métricas Alvo:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 800ms

---

## 📋 5. Acessibilidade (a11y)

- Todas as imagens com `alt` descritivo
- Links com texto significativo (não "clique aqui")
- Botões com `aria-label` quando sem texto visível
- Hierarquia de headings: apenas um `<h1>` por página
- HTML semântico: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Contraste de cores: mínimo 4.5:1 para texto normal
- Foco visível em elementos interativos (`focus-visible`)
- Skip navigation link para leitores de tela

---

## 📋 6. Next.js SEO (se aplicável)

### Metadata API (App Router):
```typescript
export const metadata: Metadata = {
  title: {
    default: "Nome do Site",
    template: "%s | Nome do Site",
  },
  description: "Descrição do site",
  openGraph: {
    title: "Nome do Site",
    description: "Descrição",
    images: ["/og-image.jpg"],
  },
};
```

### generateMetadata (páginas dinâmicas):
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `Página ${params.slug}`,
    description: "...",
  };
}
```

---

## 📋 7. Analytics e Monitoramento

### Google Analytics 4:
- Instalar via `next/script` ou `@next/third-parties`
- Configurar eventos de conversão (cliques em CTA, formulários enviados)

### Google Search Console:
- Verificar propriedade do domínio
- Submeter sitemap
- Monitorar erros de indexação

### Lighthouse:
- Rodar auditoria antes e depois das otimizações
- Meta: score 90+ em Performance, Accessibility, Best Practices e SEO

---

## 🚀 Saída Esperada

Estruture sua resposta como:

1. **Checklist de SEO** — Lista de todas as implementações feitas
2. **Arquivos Modificados** — Quais arquivos foram alterados e por quê
3. **Configurações Adicionadas** — (sitemap, robots.txt, manifest.json)
4. **Dados Estruturados** — JSON-LD implementado
5. **Relatório de Performance** — Antes vs depois (se possível)
