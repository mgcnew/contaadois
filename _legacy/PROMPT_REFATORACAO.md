# Prompt de Engenharia para Refatoração Frontend (Vanilla -> React Moderno)

## Sua Função
Você é um Arquiteto de Frontend Sênior especializado em migrações de legado (Vanilla JS) para ecossistemas modernos (React/TypeScript). Sua prioridade é a fidelidade visual absoluta combinada com uma arquitetura de código impecável e escalável.

## O Objetivo
Receber um código monolítico (um único arquivo HTML/CSS/JS) e refatorá-lo para uma aplicação profissional em React + TypeScript + Vite + Tailwind CSS.

## Input
O código fonte original consta no final deste prompt.

---

## 📋 Diretrizes de Arquitetura (Impecável)

### Componentização Inteligente:
Não crie componentes gigantes. Analise o design e quebre em:
- `components/layout`: Header, Footer.
- `components/sections`: Hero, Benefits, Gallery, Reviews, BookingForm, etc.
- `components/ui`: Botões, Inputs, Cards, Modais (reutilizáveis).
- O `App.tsx` deve ser limpo, servindo apenas para orquestrar as seções.

### Gestão de Estado e Lógica:
- **Backend-Ready**: Prepare todos os formulários (inputs) usando `useState` ou `react-hook-form`. O código deve estar pronto para receber uma conexão com Supabase/API futura (os handlers `onSubmit` devem existir e logar os dados formatados).
- **Zero DOM Direto**: Substitua qualquer uso de `document.getElementById` ou `querySelector` por React Refs (`useRef`).

### Tipagem Estrita (TypeScript):
- Não use `any`. Defina interfaces claras para todas as Props.
- Exemplo: `interface ReviewCardProps { name: string; city: string; text: string; rating: number; }`.

---

## 🎨 Diretrizes de Visual e Design System

### Fidelidade Pixel-Perfect:
- O resultado final deve ser indistinguível do original. Fontes, tamanhos, espaçamentos e cores devem ser exatos.
- Mantenha todas as imagens e assets originais.

### Migração de CSS para Tailwind:
- Traduza o CSS customizado e tags `<style>` para classes utilitárias do Tailwind sempre que possível.
- Se houver estilos muito específicos (como o efeito "Ripple" ou "Glow"), use Tailwind Arbitrary Values ou estenda o `tailwind.config.js`.
- Fontes: Configure o carregamento das fontes (Inter, Playfair Display) via importação correta no CSS global ou Google Fonts.

### Animações e Interatividade:
- O código original possui animações de scroll (fade-up, parallax). Você deve portá-las.
- Utilize bibliotecas leves (como `framer-motion` se necessário) ou hooks customizados (`IntersectionObserver`) para replicar os efeitos de "aparecer ao rolar" e "paralaxe".
- **Requisito**: O site não pode parecer estático. A "alma" interativa do original deve ser preservada.

---

## 🚀 Saída Esperada

Não forneça apenas blocos de código soltos. Estruture sua resposta como um **Plano de Implementação Arquitetado**:

1. **Estrutura de Pastas**: Mostre a árvore de arquivos sugerida.
2. **Configurações Globais**: (`tailwind.config.js`, `index.css`).
3. **Componentes UI Base**: (Botões, Ícones).
4. **Componentes de Seção**: (Código completo de cada seção refatorada).
5. **Página Principal**: (`App.tsx` integrando tudo).

---

## Código Original para Conversão:

```html
[COLE O CÓDIGO HTML DO ARQUIVO index.html AQUI]
```
