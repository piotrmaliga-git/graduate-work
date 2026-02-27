# Phishing E‑mail Analyzer — Frontend

Interfejs webowy do analizy wiadomości e‑mail pod kątem phishingu. Zbudowany w Angular 19+ z wykorzystaniem signal‑based architecture i Tailwind CSS.

---

## 🔧 Technologie

| Narzędzie | Wersja | Opis |
|-----------|--------|------|
| Angular | 19+ | Framework frontendowy |
| TypeScript | 5.x | Język programowania |
| Tailwind CSS | 3.x | Utility‑first CSS framework |
| PostCSS | latest | Przetwarzanie stylów |
| Node.js | 20+ | Środowisko uruchomieniowe |
| npm | 10+ | Menedżer pakietów |

---

## ✨ Kluczowe cechy Angulara

| Cecha | Opis |
|-------|------|
| **Standalone components** | Wszystkie komponenty `standalone: true`, bez `NgModule` |
| **Signal inputs** | `input()`, `input.required()` zamiast dekoratora `@Input()` |
| **Signal outputs** | `output()` zamiast `@Output()` + `EventEmitter` |
| **Signals** | `signal()`, `computed()`, `effect()` do zarządzania stanem |
| **New control flow** | `@if`, `@for`, `@switch` zamiast `*ngIf`, `*ngFor`, `[ngSwitch]` |
| **OnPush** | `ChangeDetectionStrategy.OnPush` na wszystkich komponentach |
| **SSR ready** | Server‑Side Rendering via `main.server.ts` + `server.ts` |

---

## 📁 Struktura

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/          # Komponenty UI (standalone)
│   │   │   ├── analyzer/        # Formularz analizy e‑maila
│   │   │   ├── results/         # Karta wyniku
│   │   │   ├── info/            # Opisy modeli AI
│   │   │   ├── header/          # Nagłówek
│   │   │   └── footer/          # Stopka
│   │   ├── pages/               # Komponenty stron (lazy-loaded)
│   │   ├── routes/              # Definicje tras Angular Router
│   │   ├── services/            # ApiService — komunikacja z backendem
│   │   ├── models/              # Interfejsy TS (EmailRequest, AnalysisResult)
│   │   ├── tests/               # Testy jednostkowe
│   │   └── app.ts               # Root standalone component
│   ├── styles/                  # Globalne style (Tailwind + custom)
│   ├── main.ts                  # Bootstrap CSR
│   ├── main.server.ts           # Bootstrap SSR
│   ├── server.ts                # Express server (SSR)
│   └── index.html               # Główny plik HTML
├── angular.json                 # Konfiguracja Angular CLI
├── tailwind.config.js           # Konfiguracja Tailwind CSS
├── postcss.config.js            # Konfiguracja PostCSS
├── tsconfig.json                # Konfiguracja TypeScript
├── .editorconfig                # Ustawienia edytora
├── .prettierrc                  # Konfiguracja formatowania
└── package.json                 # Zależności i skrypty
```

---

## 🚀 Instalacja i uruchomienie

### 1. Sklonuj repozytorium

```bash
git clone <url-repo>
cd frontend
```

### 2. Zainstaluj zależności

```bash
npm install
```

### 3. Uruchom dev server

```bash
ng serve
```

Aplikacja dostępna pod http://localhost:4200

### 4. Build produkcyjny

```bash
ng build
```

Wynik w `dist/`.

### 5. Build SSR (opcjonalnie)

```bash
ng build --configuration=production
node dist/frontend/server/server.mjs
```

---

## 🧩 Komponenty

### `AnalyzerComponent`

Formularz do wpisania treści e‑maila i adresu nadawcy, wyboru modelu AI.

```typescript
// Inputs
loading = input.required<boolean>();
externalError = input<string>('', { alias: 'error' });

// Outputs
analyzeRequest = output<{ emailText: string; selectedModel: string; sender: string }>();

// Internal state
emailText = signal<string>('');
sender = signal<string>('');
selectedModel = signal<string>('gpt-3.5-turbo');
```

### `ResultsComponent`

Wyświetla wynik analizy — model, nadawcę, predykcję (phishing/legit) i timestamp.

```typescript
result = input<AnalysisResult | null>(null);
```

### `HeaderComponent` / `FooterComponent`

Nagłówek i stopka strony.

### `InfoComponent`

Statyczny opis dostępnych modeli AI.

---

## 🎨 Stylizacja

- **Tailwind CSS** — klasy utility bezpośrednio w szablonach
- Kolory statusów:
  - Phishing → `text-danger` / `bg-red-100`
  - Legit → `text-success` / `bg-green-100`
- Responsywny layout

---

## 📡 Komunikacja z backendem

`ApiService` komunikuje się z backendem na `http://localhost:8000`:

```typescript
// POST /analyze
analyzeEmail(request: EmailRequest): Promise<AnalysisResult>
```

Wymaga uruchomionego backendu — patrz [backend/README.md](../backend/README.md).

---

## 🧪 Testy

```bash
ng test
```

Testy jednostkowe w `src/app/tests/`.

---

## 📋 Dostępne skrypty

| Komenda | Opis |
|---------|------|
| `ng serve` | Dev server z hot reload |
| `ng build` | Build produkcyjny |
| `ng test` | Uruchom testy jednostkowe |
| `ng lint` | Sprawdź linting |