# SoberanoAIM — Especificação Completa do Sistema

> Documento para recriação fiel do sistema por outra IA.  
> Stack: React 18 + TypeScript + Tailwind CSS + Vite  
> Linguagem da interface: Português Brasileiro

---

## 1. Visão Geral

Aplicação single-page (SPA) sem roteador externo. Toda a navegação é gerenciada por um estado React simples (`AppView`). O sistema possui três telas distintas:

| View | Tipo | Descrição |
|---|---|---|
| `"landing"` | Página pública | Landing page de vendas com 9 seções |
| `"login"` | Autenticação | Formulário de login sem validação real |
| `"dashboard"` | Área do cliente | Painel com 5 abas internas |

### Estado raiz

```ts
type AppView = "landing" | "login" | "dashboard";
type DashTab = "overview" | "models" | "license" | "downloads" | "settings";

interface User {
  email: string;   // email digitado no login
  name: string;    // derivado do email: email.split("@")[0].replace(/[._]/g, " ")
  plan: string;    // sempre "Sovereign" (hardcoded no mock)
}
```

O componente raiz `App` controla `view: AppView` e `user: User | null`. Ao fazer login com sucesso, seta ambos e muda a view para `"dashboard"`. Ao sair, limpa ambos e volta para `"landing"`.

---

## 2. Design System

### 2.1 Paleta de Cores

```ts
const GOLD      = "#c9a227"  // Cor primária — dourado da logo/coroa/escudo
const RED       = "#cc2200"  // Accent — vermelho do mascote diabo
const NAVY      = "#1a2a5e"  // Azul navy da marca
const TECH_BLUE = "#4da6d6"  // Azul tech dos circuitos
```

Cores de suporte utilizadas inline:
- `#22c55e` — verde "online / ativo"
- `#f97316` — laranja "pausado / aviso"
- `#8b5cf6` — roxo para variação de modelos
- `#ff6b6b` — vermelho claro para ações destrutivas

### 2.2 Tokens CSS (theme.css)

```css
:root {
  --background:          #07091a;   /* canvas principal — navy quase preto */
  --foreground:          #e4e6f0;   /* texto padrão */
  --card:                #0d1228;   /* superfície de cards */
  --card-foreground:     #e4e6f0;
  --primary:             #c9a227;   /* dourado */
  --primary-foreground:  #07091a;
  --secondary:           #1a2a5e;   /* navy */
  --secondary-foreground:#e4e6f0;
  --muted:               #111829;
  --muted-foreground:    #7a84a0;
  --accent:              #cc2200;   /* vermelho */
  --accent-foreground:   #ffffff;
  --border:              rgba(201,162,39,0.18);  /* hairline dourado */
  --ring:                #c9a227;
  --radius:              0.375rem;
  --font-weight-medium:  600;
  --font-weight-normal:  400;
}
```

O bloco `.dark` repete os mesmos valores (a app é sempre dark). O bloco `@theme inline` e o mapeamento de classes Tailwind devem ser preservados integralmente.

### 2.3 Tipografia

Importar via Google Fonts em `fonts.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');
```

| Família | Uso |
|---|---|
| `Rajdhani` | Headings, títulos de seção, labels de botão, sidebar. Peso 700. Tudo em UPPERCASE. |
| `DM Sans` | Corpo de texto, parágrafos descritivos, placeholders. |
| `JetBrains Mono` | Labels técnicos (versão, latência, status), badges, breadcrumbs de navegação. |

### 2.4 Padrões Visuais Recorrentes

**Background da página:**
```css
background: #07091a;
backgroundImage: linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px);
backgroundSize: 60px 60px;
```

**Card padrão:**
```css
background: rgba(13,18,40,0.7);
border: 1px solid rgba(201,162,39,0.15);
```

**Card destacado (highlight):**
```css
background: linear-gradient(135deg, #0d1228 0%, #111d40 100%);
border: 1px solid rgba(201,162,39,0.5);
```

**Botão primário (CTA dourado):**
```css
background: linear-gradient(135deg, #c9a227, #a87d15);
color: #07091a;
font-family: Rajdhani;
font-weight: 700;
text-transform: uppercase;
letter-spacing: widest;
```

**Botão outline dourado:**
```css
background: transparent;
border: 1px solid rgba(201,162,39,0.35);
color: #c9a227;
```

**Badge/tag inline:**
```css
font-family: JetBrains Mono;
font-size: xs;
text-transform: uppercase;
letter-spacing: widest;
color: [cor do item];
background: [cor do item]18;  /* 10% opacidade */
border: 1px solid [cor do item]40;  /* 25% opacidade */
```

**Barra de progresso (precisão):**
```html
<div style="background: rgba(255,255,255,0.06); height: 6px;">
  <div style="width: {valor}%; background: {cor}; height: 100%;" />
</div>
```

**Indicador de status (ponto colorido):**
```html
<span style="width:8px; height:8px; border-radius:50%; background: #22c55e;" />
```

---

## 3. Estrutura de Componentes

```
App                          ← raiz, controla view e user
├── NavBar                   ← fixo no topo, oculto no dashboard
├── [view === "landing"]
│   └── LandingPage
│       ├── HeroSection
│       ├── ProductsSection
│       ├── ModelsSection
│       ├── FeaturesSection
│       ├── PricingSection
│       ├── TestimonialsSection
│       ├── CTABanner
│       └── Footer
├── [view === "login"]
│   └── LoginPage
└── [view === "dashboard"]
    └── Dashboard
        ├── Sidebar (desktop, w-64)
        ├── MobileHeader + DrawerSidebar
        ├── TopBar (breadcrumb + status)
        └── [tab]
            ├── OverviewTab     → "overview"
            ├── ModelsTab       → "models"
            ├── LicenseTab      → "license"
            ├── DownloadsTab    → "downloads"
            └── SettingsTab     → "settings"
```

---

## 4. NavBar

**Comportamento:**
- Fixed top, z-50
- Transparente no topo da landing; com `background: rgba(7,9,26,0.97)`, `backdropFilter: blur(12px)` e borda dourada ao scrollar > 40px
- Sempre sólido quando `view === "login"`
- **Oculto completamente quando `view === "dashboard"`** (retorna `null`)

**Conteúdo (landing):**
- Logo à esquerda (ImageWithFallback)
- Links centrais: "Produto", "Modelos IA", "Preços", "Suporte" — âncoras href `#produto`, `#modelos-ia`, `#preços`, `#suporte`
- Botão "Login" (outline dourado) → `onLogin()`
- Botão "Comprar Agora" (gradiente dourado) → âncora `#preços`
- Mobile: ícone hamburger; menu drawer vertical com os mesmos links

**Conteúdo (login):**
- Logo à esquerda
- Apenas botão "Login" ou "Sair" no canto direito

---

## 5. Landing Page — Seções

### 5.1 HeroSection

Layout: `grid md:grid-cols-2`, altura mínima de `100vh`, `padding-top: 80px`.

**Coluna esquerda:**
- Badge inline: ponto verde pulsante + "Sistema Online · v4.2.1" (JetBrains Mono, borda dourada)
- Headline H1 em 3 linhas: "DOMINE" / "**CADA**" (dourado) / "PARTIDA" — Rajdhani 700, 5xl-7xl
- Parágrafo descritivo (DM Sans, cor `#7a84a0`)
- Dois CTAs: "Começar Agora →" (dourado preenchido) + "Ver Modelos IA" (outline dourado)
- Row de 3 stats: `12K+ / Usuários ativos`, `0.3ms / Latência média`, `99.8% / Uptime garantido`
  - Separados por `border-top: 1px solid rgba(201,162,39,0.15)`, `margin-top: 56px`
  - Valor em Rajdhani dourado 3xl; label em JetBrains Mono muted xs uppercase

**Coluna direita:**
- Logo/mascote em ImageWithFallback (arquivo `WhatsApp_Image_2026-08-18_at_15.15.11.jpeg`)
- Container com `border: 1px solid rgba(201,162,39,0.25)`, `background: rgba(13,18,40,0.6)`, `backdropFilter: blur(8px)`
- Glow radial navy no fundo

**Efeitos de fundo:**
- Grid de linhas douradas 60px (opacity 4%)
- Radial glow navy centralizado na coluna direita
- Gradiente `linear-gradient(to bottom, transparent, #07091a)` na borda inferior

---

### 5.2 ProductsSection (id="produto")

Grid 2 colunas em md. Cada card tem:
- Ícone em box colorido + badge de texto à direita
- Título + descrição + lista de features com CheckCircle
- CTA button

**Card 1 — AIM Assist Pro** (highlight): gradiente escuro, borda dourada mais forte, ícone Crosshair, badge "SOFTWARE", CTA preenchido dourado.

**Card 2 — Modelos IA** (normal): fundo translúcido, borda fraca, ícone Bot, badge "MARKETPLACE" em azul tech, CTA outline dourado.

---

### 5.3 ModelsSection (id="modelos-ia")

Grid `sm:grid-cols-2 lg:grid-cols-3`. 6 modelos:

| ID | Nome | Jogo | Versão | Precisão | Latência | Tipo | Cor |
|---|---|---|---|---|---|---|---|
| cs2 | SOBERANO-CS2 | Counter-Strike 2 | v3.1.0 | 94.2% | 0.28ms | Humanizado | #c9a227 |
| vlr | SOBERANO-VLR | VALORANT | v2.9.4 | 96.8% | 0.31ms | Agressivo | #cc2200 |
| apx | SOBERANO-APX | Apex Legends | v2.5.2 | 91.5% | 0.35ms | Suave | #4da6d6 |
| cod | SOBERANO-COD | Call of Duty: BO6 | v1.8.0 | 93.1% | 0.29ms | Balanceado | #8b5cf6 |
| fn | SOBERANO-FN | Fortnite | v2.2.1 | 88.7% | 0.41ms | Humanizado | #22c55e |
| r6 | SOBERANO-R6 | Rainbow Six Siege | v1.5.3 | 95.0% | 0.26ms | Preciso | #f97316 |

Cada card: nome do modelo (JetBrains Mono, cor do modelo) + nome do jogo (Rajdhani bold) + badge tipo + barra de precisão + botão "Adquirir" outline na cor do modelo.

---

### 5.4 FeaturesSection

Grid `sm:grid-cols-2 lg:grid-cols-3` com gap-px e background `rgba(201,162,39,0.08)` (cria grid lines douradas entre cards).

6 features:
1. Rastreamento Neural — Target — dourado
2. Latência Sub-ms — Zap — vermelho
3. Anti-Detecção — Shield — azul tech
4. Perfis Dinâmicos — Activity — roxo #8b5cf6
5. Visão Computacional — Eye — verde #22c55e
6. Licença por Hardware — Lock — laranja #f97316

Cada item: ícone em box colorido + título Rajdhani + descrição DM Sans muted. Hover: background escurece.

---

### 5.5 PricingSection (id="preços")

Toggle "Mensal / Anual −33%" (botões estilo pill). Estado local `billing: "mensal" | "anual"`.

3 planos em grid md:3:

| Plano | Preço Mensal | Preço Anual | Destaque | Cor |
|---|---|---|---|---|
| STARTER | R$ 79/mês | R$ 59/mês | Não | #4da6d6 |
| SOVEREIGN | R$ 149/mês | R$ 99/mês | **Sim** (badge "MAIS POPULAR") | #c9a227 |
| ELITE | R$ 279/mês | R$ 199/mês | Não | #8b5cf6 |

O plano SOVEREIGN tem badge absoluta `-top-3 left-1/2 -translate-x-1/2` com gradiente dourado.

Features por plano:
- **STARTER:** 1 modelo IA incluído, 1 jogo ativo, Atualizações mensais, Suporte por e-mail, Licença 1 hardware
- **SOVEREIGN:** 4 modelos IA incluídos, Todos os jogos suportados, Atualizações em tempo real, Suporte prioritário 24/7, Licença 2 hardwares, Configuração assistida
- **ELITE:** Modelos ilimitados, API de integração, Perfis customizados sob medida, Gerente de conta dedicado, Licença 5 hardwares, Early access a novos modelos, Suporte por WhatsApp

Rodapé da seção: "Pagamento via PIX, cartão de crédito ou criptomoeda · Cancelamento imediato a qualquer momento"

---

### 5.6 TestimonialsSection

Grid md:3, 3 depoimentos com 5 estrelas cada:

- **Lucas M.** — Global Elite · CS2 — "Melhor investimento que fiz nos últimos anos. O modelo do CS2 é absurdamente natural. Ninguém percebe, parece que melhorei do nada." — Cliente há 8 meses
- **Igor R.** — Radiante · VALORANT — "Testei vários softwares similares. O SoberanoAIM é o único que sobrevive aos updates do Vanguard. Suporte é rápido e resolutivo." — Cliente há 14 meses
- **Pedro V.** — Predator · Apex Legends — "Plano Sovereign vale cada centavo. Uso 3 modelos diferentes e todos estão com latência impecável. Deploy em menos de 2 minutos." — Cliente há 5 meses

Cada card: estrelas douradas preenchidas + citação em aspas + linha divisória + nome (Rajdhani) + rank (JetBrains dourado) + "cliente há X" (JetBrains muted).

---

### 5.7 CTABanner

Seção com fundo gradiente navy + red suave + grid de linhas opacity 5%. Bordas superior e inferior douradas.

Badge vermelha "OFERTA LIMITADA". Headline "PRONTO PARA SER **SOBERANO?**". Parágrafo com código promocional em box inline: `SOBERANO20` (JetBrains Mono, fundo dourado 12%). CTA grande "Ativar Agora →".

---

### 5.8 Footer

Grid md:4. Coluna 1: logo + tagline + indicador verde "Sistemas operacionais". Colunas 2-4:

- **Produto:** AIM Assist Pro, Modelos IA, Marketplace, Changelog
- **Suporte:** Central de Ajuda, Discord, WhatsApp, Status do Sistema
- **Empresa:** Sobre Nós, Termos de Uso, Privacidade, Revendedores

Rodapé: "© 2026 SoberanoAIM · Sovereign AI" + botão texto "Área do Cliente →" que chama `onLogin()`.

---

## 6. LoginPage

Página centralizada verticalmente, `padding-top: 80px`. Fundo com grid dourado + radial glow navy.

**Card central** (`max-w-md`, `p-10`):
- `background: rgba(13,18,40,0.9)`, `border: 1px solid rgba(201,162,39,0.3)`, `backdropFilter: blur(16px)`

**Conteúdo:**
1. Logo centralizado (ImageWithFallback, h-14)
2. Título "ÁREA DO CLIENTE" (Rajdhani 700, 3xl, centrado)
3. Subtítulo "Acesse sua conta SoberanoAIM" (DM Sans, muted, centrado)
4. Formulário:
   - Campo **E-mail** (type="email"): label JetBrains Mono uppercase; input com borda dourada 20% que vira 60% no focus
   - Campo **Senha** (type="password"): mesmo estilo; botão olho (ícone Eye) para toggle `showPw`
   - Bloco de **erro** condicional (ícone AlertCircle + texto vermelho): só aparece se campos estiverem vazios
   - Link "Esqueci minha senha" alinhado à direita (decorativo)
   - Botão **"Entrar →"**: gradiente dourado; quando `loading=true` mostra SVG spinner animado + "Autenticando..."
5. Link "Ainda não tem conta? Adquirir licença"
6. Botão "← Voltar ao site" abaixo do card → `onBack()`

**Lógica de autenticação (mock):**
```ts
function handleSubmit(e) {
  if (!email || !password) { setError("Preencha e-mail e senha."); return; }
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    onSuccess({
      email,
      name: email.split("@")[0].replace(/[._]/g, " "),
      plan: "Sovereign",
    });
  }, 1200); // delay simulado de 1.2s
}
```

**Não há validação real de credenciais.** Qualquer e-mail + senha não-vazios loga com sucesso.

---

## 7. Dashboard

Layout `flex min-h-screen`:
- **Sidebar** (apenas md+): `w-64`, `background: rgba(13,18,40,0.95)`, `border-right: 1px solid rgba(201,162,39,0.15)`
- **Main**: `flex-1`, com topbar + conteúdo da aba ativa

### 7.1 Sidebar Desktop

1. **Header**: logo (h-10, object-contain), com border-bottom dourada
2. **User pill**: avatar quadrado com inicial em dourado + nome + plano (JetBrains Mono dourado)
3. **Nav items** (SidebarItem): 5 itens. Item ativo: `background: rgba(201,162,39,0.1)`, `border-left: 2px solid #c9a227`, texto dourado. Inativo: muted.
4. **Footer**: botão "Sair" (vermelho #ff6b6b, ícone LogOut)

**Itens de navegação:**

| id | Ícone | Label |
|---|---|---|
| `overview` | LayoutDashboard | Visão Geral |
| `models` | Bot | Modelos IA |
| `license` | CreditCard | Licença |
| `downloads` | Download | Downloads |
| `settings` | Settings | Configurações |

### 7.2 Mobile

- Fixed header: logo + botão hamburger (Menu icon dourado)
- Ao clicar: drawer lateral com `w-72`, overlay `bg-black/60` para fechar
- Drawer tem os mesmos items da sidebar + botão fechar (X)

### 7.3 TopBar (md+)

Flex entre breadcrumb (JetBrains Mono muted, label da aba atual) e right side:
- Indicador "Sistema Online" (ponto verde pulsante + texto verde JetBrains)
- Botão Bell com badge vermelha no canto superior direito

---

## 8. Abas do Dashboard

### 8.1 OverviewTab

**Seção Welcome:**
- "Olá, **{nome}**" (nome em dourado) — Rajdhani 3xl
- "Painel de controle — Plano **Sovereign**"

**Grid de 4 StatCards** (grid-cols-2 lg:grid-cols-4):

| Label | Valor | Subtexto | Cor | Ícone |
|---|---|---|---|---|
| Modelos Ativos | 2 | de 4 incluídos | #c9a227 | Bot |
| Sessões (mês) | 47 | +12% vs mês anterior | #4da6d6 | Activity |
| Licença | ATIVA | Vence em 12/09/2026 | #22c55e | Shield |
| Latência média | 0.30ms | Última sessão | #8b5cf6 | Zap |

Cada StatCard: label xs JetBrains muted + ícone à direita (cor do card) + valor Rajdhani 3xl + subtexto DM Sans muted xs.

**Lista "Meus Modelos"** (3 modelos mock):
- CS2: Ativo, 94.2%, 0.28ms — cor dourada
- VALORANT: Ativo, 96.8%, 0.31ms — cor vermelha
- Apex Legends: Pausado, 91.5%, 0.35ms — cor azul tech

Cada linha: ícone Crosshair colorido + nome jogo + versão badge + precisão + latência + indicador status (verde/laranja).

**Tabela "Atividade Recente"** (5 entradas):

| Hora | Evento | Jogo | Duração |
|---|---|---|---|
| Hoje, 14:32 | Sessão iniciada | Counter-Strike 2 | 2h 14min |
| Hoje, 11:05 | Modelo atualizado | VALORANT v2.9.4 | — |
| Ontem, 21:48 | Sessão iniciada | VALORANT | 3h 07min |
| Ontem, 18:20 | Sessão iniciada | Counter-Strike 2 | 1h 52min |
| 17/08, 22:10 | Login efetuado | — | — |

Primeira linha tem ponto verde; demais têm ponto `#2a3050`. Duração exibida em dourado quando presente.

---

### 8.2 ModelsTab

**Seção "Instalados"** (3 modelos — mesmos do mock): cada card expandido com:
- Header: ícone Bot colorido + nome jogo + versão badge + data de última atualização
- Botões: "Atualizar" (outline muted) + "Pausar"/"Ativar" (vermelho/verde conforme status)
- Grid 3 colunas: Precisão (com barra de progresso), Latência, Status

**Seção "Disponíveis no seu plano"** (3 cards menores):

| Nome | Jogo | Versão | Cor |
|---|---|---|---|
| SOBERANO-COD | Call of Duty: BO6 | v1.8.0 | #8b5cf6 |
| SOBERANO-FN | Fortnite | v2.2.1 | #22c55e |
| SOBERANO-R6 | Rainbow Six Siege | v1.5.3 | #f97316 |

Cada card pequeno: ícone Bot + nome jogo + versão + botão "+ Instalar" outline na cor do modelo.

---

### 8.3 LicenseTab

**Card do plano** (gradiente navy destacado, borda dourada 45%):
- Esquerda: "Plano Atual" label + "SOVEREIGN" Rajdhani 4xl + ponto verde + "Ativa — Renova em 12/09/2026"
- Direita: "R$ 149" dourado 4xl + "/mês · cobrança automática" + botões "Alterar Plano" e "Cancelar"

**Chave de Licença:**
- Exibição: `SBR-2026-A4F7-K9QX-JD38-PLMV` (JetBrains Mono, monospace)
- Botão "Copiar" com `navigator.clipboard.writeText()`. Ao copiar: muda para verde "Copiado!" por 2s. Usa estado `copied: boolean`.

**Hardware Autorizado** (2 entradas):

| ID | Label | OS | Status | Último acesso |
|---|---|---|---|---|
| HW-001 | PC Principal | Windows 11 Pro 64-bit | Online (verde) | Agora |
| HW-002 | PC Secundário | Windows 10 64-bit | Offline (muted) | 12/08/2026 |

Cada linha: ícone HardDrive (dourado se online, muted se offline) + label + ID badge + OS + ponto de status.

---

### 8.4 DownloadsTab

**Banner de aviso** (fundo dourado 8%, borda dourada 25%): ícone AlertCircle + texto sobre segurança.

**Lista de arquivos** (tabela com border-bottom entre linhas):

| Arquivo | Versão | Tamanho | Data | Obrigatório |
|---|---|---|---|---|
| SoberanoAIM Loader | v4.2.1 | 18.4 MB | 19/08/2026 | Sim |
| Driver de Injeção | v2.0.8 | 4.1 MB | 15/08/2026 | Sim |
| Painel de Configuração | v3.5.2 | 9.7 MB | 10/08/2026 | Não |
| Manual do Usuário (PDF) | — | 2.3 MB | 01/08/2026 | Não |

Cada linha: ícone Package (box dourado) + nome + badges de versão e "OBRIGATÓRIO" (verde) + tamanho/data + botão "Baixar" dourado preenchido.

**Guia de Instalação** (5 passos numerados):
1. Desative seu antivírus temporariamente antes da instalação.
2. Instale o Driver de Injeção como Administrador e reinicie o PC.
3. Execute o Loader como Administrador e autentique com sua licença.
4. Abra o Painel de Configuração e selecione o jogo desejado.
5. Inicie o jogo e ative o modelo IA pelo painel.

Números em box dourado pequeno.

---

### 8.5 SettingsTab

**Seção Perfil** (formulário):
- Campo "Nome de exibição": editável, pré-preenchido com `user.name`
- Campo "E-mail": disabled (opacity 40%), pré-preenchido com `user.email`
- Botão "Salvar Alterações": ao clicar, muda para verde "✓ Salvo!" por 2s

**Seção Segurança** (botões lista):
- "Alterar Senha" (ícone Lock)
- "Autenticação em 2 Fatores" (ícone Shield)
- Ambos decorativos com ChevronRight à direita

**Zona de Risco** (fundo vermelho 6%, borda vermelha 20%):
- Título "Zona de Risco" em vermelho
- Botão "Encerrar Sessão" (outline vermelho, ícone LogOut) → chama `onLogout()`

---

## 9. Dados Mock

### Modelos instalados (MOCK_MODELS)
```ts
[
  { id:"cs2", name:"SOBERANO-CS2", game:"Counter-Strike 2", ver:"v3.1.0", status:"Ativo",   precision:94.2, latency:"0.28ms", color:"#c9a227", lastUpdate:"19/08/2026" },
  { id:"vlr", name:"SOBERANO-VLR", game:"VALORANT",          ver:"v2.9.4", status:"Ativo",   precision:96.8, latency:"0.31ms", color:"#cc2200", lastUpdate:"18/08/2026" },
  { id:"apx", name:"SOBERANO-APX", game:"Apex Legends",      ver:"v2.5.2", status:"Pausado", precision:91.5, latency:"0.35ms", color:"#4da6d6", lastUpdate:"14/07/2026" },
]
```

### Atividade (MOCK_ACTIVITY)
```ts
[
  { time:"Hoje, 14:32",    event:"Sessão iniciada",  game:"Counter-Strike 2",  duration:"2h 14min" },
  { time:"Hoje, 11:05",    event:"Modelo atualizado", game:"VALORANT v2.9.4",  duration:"—" },
  { time:"Ontem, 21:48",   event:"Sessão iniciada",  game:"VALORANT",          duration:"3h 07min" },
  { time:"Ontem, 18:20",   event:"Sessão iniciada",  game:"Counter-Strike 2",  duration:"1h 52min" },
  { time:"17/08, 22:10",   event:"Login efetuado",   game:"—",                 duration:"—" },
]
```

---

## 10. Comportamentos de UI

| Comportamento | Detalhe |
|---|---|
| Hover em cards de produto/modelo | `transform: translateY(-4px)`, `transition: all 300ms` |
| Hover em links/botões | `opacity: 90%` ou `bg-white/5` |
| Focus em inputs | Borda dourada muda de `rgba(201,162,39,0.2)` para `rgba(201,162,39,0.6)` |
| Botão com estado "salvo/copiado" | Muda para verde por 2s com `setTimeout` |
| Spinner de loading no login | SVG inline com classe `animate-spin` |
| Ponto online na badge | `animate-pulse` |
| Sidebar item ativo | Border-left dourada 2px + fundo gold/10 |
| Sidebar mobile | Drawer overlay com `bg-black/60` clicável para fechar |
| NavBar scroll | Transparente → sólida ao passar 40px |

---

## 11. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< md` (< 768px) | Hero: coluna única. Grids colapsam para 1 coluna. Dashboard: topbar fixa + drawer lateral ao invés de sidebar. |
| `md+` (≥ 768px) | Hero: 2 colunas. Sidebar dashboard visível. NavBar links visíveis. |
| `lg+` (≥ 1024px) | Grids de 3 colunas (modelos, features). Stats do dashboard: 4 colunas. |

---

## 12. Assets & Dependências

### Imagem
- Arquivo: `src/imports/WhatsApp_Image_2026-08-18_at_15.15.11.jpeg`
- Uso: logo + mascote diabo coroado
- Importação obrigatória via ES module: `import logoImg from "@/imports/..."`
- Renderização via: `<ImageWithFallback src={logoImg} alt="SoberanoAIM" />`
- Localização do componente: `src/app/components/figma/ImageWithFallback.tsx`

### Ícones (lucide-react)
```
Shield, Zap, Target, ChevronRight, Menu, X, Star, CheckCircle,
ArrowRight, Lock, Activity, Eye, Crosshair, Bot,
LayoutDashboard, Download, CreditCard, Settings, LogOut,
Bell, Key, HardDrive, RefreshCw, TrendingUp, Users,
Clock, Copy, AlertCircle, Package
```

### Pacotes npm já disponíveis
- `react` + `react-dom` (v18)
- `lucide-react`
- `tailwindcss`
- Sem roteador externo necessário (navegação por estado)

---

## 13. Arquivos a Criar/Modificar

| Arquivo | Ação | Conteúdo |
|---|---|---|
| `src/app/App.tsx` | Reescrever | Todos os componentes (ver seções acima) |
| `src/styles/fonts.css` | Escrever | `@import` Google Fonts (Rajdhani + DM Sans + JetBrains Mono) |
| `src/styles/theme.css` | Atualizar tokens | Paleta dark sovereign (ver seção 2.2) |

**Não criar** arquivos auxiliares, helpers separados, ou context providers. Todo o estado é local com `useState` direto nos componentes raiz.

---

## 14. Fluxo de Navegação Completo

```
[Usuário abre o site]
        ↓
  Landing Page
        ↓
  clica "Login" (nav ou footer)
        ↓
  LoginPage
   ├── campos vazios → erro inline
   └── e-mail + senha preenchidos → spinner 1.2s → Dashboard
                                                       ↓
                                              5 abas internas
                                              (overview, models,
                                               license, downloads,
                                               settings)
                                                       ↓
                                    "Sair" (sidebar ou settings)
                                                       ↓
                                              Landing Page
```

---

*Gerado em 20/08/2026 — SoberanoAIM Sovereign AI*
