# Phishing Email Analyzer + praca magisterska

Repozytorium zawiera kompletny projekt inżyniersko-badawczy dotyczący wykrywania phishingu w wiadomościach e-mail.
Obejmuje część aplikacyjną (backend FastAPI + frontend Angular), która pozwala analizować treść wiadomości i porównywać predykcje wielu modeli LLM, a także część naukową z materiałami do pracy magisterskiej przygotowanymi w LaTeX.
Projekt umożliwia zarówno praktyczne testowanie scenariuszy bezpieczeństwa (analiza pojedynczych wiadomości), jak i eksperymenty porównawcze na zbiorze danych oraz generowanie raportów z wynikami modeli.

## Spis treści

- [Phishing Email Analyzer + praca magisterska](#phishing-email-analyzer--praca-magisterska)
  - [Spis treści](#spis-treści)
  - [Zawartość repozytorium](#zawartość-repozytorium)
  - [Wymagania](#wymagania)
  - [Szybki start (Windows / PowerShell)](#szybki-start-windows--powershell)
    - [1) Backend](#1-backend)
    - [2) Frontend](#2-frontend)
  - [Konfiguracja `.env` (backend)](#konfiguracja-env-backend)
  - [Architektura aplikacji](#architektura-aplikacji)
  - [API backendu](#api-backendu)
    - [`GET /`](#get-)
    - [`POST /analyze`](#post-analyze)
  - [Modele użyte w projekcie](#modele-użyte-w-projekcie)
  - [Aktualny status i ograniczenia](#aktualny-status-i-ograniczenia)
  - [Testowanie i skrypty](#testowanie-i-skrypty)
    - [Backend: porównanie modeli](#backend-porównanie-modeli)
    - [Backend: przygotowanie danych](#backend-przygotowanie-danych)
    - [Frontend: testy i jakość](#frontend-testy-i-jakość)
    - [Frontend: E2E Playwright](#frontend-e2e-playwright)
  - [Format danych wejściowych (`data/data.json`)](#format-danych-wejściowych-datadatajson)
  - [Raporty](#raporty)
  - [Zrzuty ekranu aplikacji](#zrzuty-ekranu-aplikacji)
    - [Ekran główny](#ekran-główny)
    - [Wynik analizy](#wynik-analizy)
    - [Widok mobilny (opcjonalnie)](#widok-mobilny-opcjonalnie)
  - [Część pracy magisterskiej](#część-pracy-magisterskiej)
  - [Wskazówki operacyjne](#wskazówki-operacyjne)

## Zawartość repozytorium

```
.
|-- phishing-email-analyzer/
|   |-- backend/              # API FastAPI, integracje modeli, skrypty testowe
|   `-- frontend/             # aplikacja Angular (UI + testy)
|-- data/
|   `-- data.json             # zbiór wiadomości do testów
|-- reports/                  # raporty JSON z uruchomień modeli
`-- forma_pisemna/            # LaTeX: treść pracy, bibliografia, grafiki
```

## Wymagania

- Python 3.13+
- Node.js 20+
- npm 11+
- (opcjonalnie) CUDA GPU dla lokalnych modeli HF/Bielik

## Szybki start (Windows / PowerShell)

### 1) Backend

```powershell
cd "phishing-email-analyzer/backend"
py -3.13 -m pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend będzie dostępny pod adresem `http://localhost:8000`.

### 2) Frontend

W nowym terminalu:

```powershell
cd "phishing-email-analyzer/frontend"
npm install
npm start
```

Frontend działa domyślnie na `http://localhost:4200` i komunikuje się z backendem pod `http://localhost:8000`.

## Konfiguracja `.env` (backend)

W katalogu `phishing-email-analyzer/backend` utwórz plik `.env` z kluczami tylko dla modeli, których chcesz używać.

```env
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
LLAMA_API_KEY=...
HF_TOKEN=...

# opcjonalnie
MISTRAL_7B_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.3
LLAMA_CLASSIFY_TIMEOUT_SEC=30
LLAMA_CLASSIFY_MAX_RETRIES=0
LLAMA_CLASSIFY_RETRY_SLEEP_SEC=1.5
```

Mapowanie kluczy:

| Zmienna | Wykorzystanie |
|---|---|
| `OPENAI_API_KEY` | `gpt-4.1` |
| `GOOGLE_API_KEY` | `gemini-2.5-pro` |
| `LLAMA_API_KEY` | `llama-cloud` |
| `HF_TOKEN` | `mistral-7b` oraz lokalne modele z Hugging Face |

## Architektura aplikacji

- Backend (`backend/main.py`) udostępnia endpoint `POST /analyze`.
- Backend dynamicznie ładuje adaptery modeli z `backend/models`.
- Frontend (`frontend/src/app`) wysyła payload do backendu przez `ApiService`.
- Dane testowe są trzymane w `data/data.json`.
- Raporty z porównań modeli trafiają do `reports/*.json`.

## API backendu

### `GET /`

Zwraca podstawowe informacje i listę dostępnych modeli.

### `POST /analyze`

Przykładowe żądanie:

```json
{
  "email_text": "Treść maila...",
  "model_name": "gpt-4.1",
  "sender": "Bank <no-reply@bank.pl>",
  "title": "Potwierdź dane"
}
```

Przykładowa odpowiedź:

```json
{
  "model": "gpt-4.1",
  "prediction": "phishing",
  "reason": "...",
  "timestamp": "2026-03-11T22:17:38.123456",
  "response_time_ms": 842.31,
  "sender": "Bank <no-reply@bank.pl>",
  "title": "Potwierdź dane"
}
```

Dozwolone etykiety klasyfikacji: `phishing` oraz `legit`.

## Modele użyte w projekcie

| Model ID | Krótki opis |
|---|---|
| `gpt-4.1` | Model OpenAI używany jako mocny punkt odniesienia jakościowego; zwykle daje najbardziej rozbudowane uzasadnienia decyzji. |
| `gemini-2.5-pro` | Model Google do klasyfikacji i uzasadniania decyzji; dobry do porównań z GPT w podobnym scenariuszu promptowania. |
| `mistral-7b` | Otwarty model uruchamiany lokalnie przez `transformers`; pozwala testować wariant bez usług chmurowych kosztem większych wymagań sprzętowych. |
| `llama-cloud` | Klasyfikacja realizowana przez usługę Llama Cloud na podstawie reguł `phishing`/`legit`; wygodna integracja API z kontrolą timeoutów. |
| `bielik-2-4bit` | Planowany wariant lokalny (Bielik 11B v2.2 w 4-bit), istotny w kontekście modeli polskojęzycznych; obecnie adapter nie jest jeszcze dodany do repozytorium. |

## Aktualny status i ograniczenia

- `backend/main.py` oraz `backend/test_all_models.py` odwołują się do pliku `backend/models/bielik2_4bit.py`, którego obecnie nie ma w repozytorium.
- W praktyce oznacza to, że uruchomienie backendu i skryptu testowego wymaga:
  1. dodania brakującego adaptera `bielik2_4bit.py`, albo
  2. tymczasowego wyłączenia obsługi modelu `bielik-2-4bit` w kodzie.
- Lokalny inference dużych modeli (`mistral-7b`, Bielik) bez GPU może być bardzo wolny lub niestabilny.

## Testowanie i skrypty

### Backend: porównanie modeli

```powershell
cd "phishing-email-analyzer/backend"

# domyślnie: 10 próbek, wszystkie modele
py -3.13 test_all_models.py

# wybrane modele
py -3.13 test_all_models.py --models gpt-4.1,gemini-2.5-pro,llama-cloud

# liczba próbek + seed
py -3.13 test_all_models.py --samples 50 --seed 7
```

### Backend: przygotowanie danych

```powershell
cd "phishing-email-analyzer/backend"

# domyślnie: tasowanie + renumeracja
py -3.13 shuffle_data.py

# tylko tasowanie
py -3.13 shuffle_data.py --shuffle

# tylko renumeracja
py -3.13 shuffle_data.py --renumber
```

### Frontend: testy i jakość

```powershell
cd "phishing-email-analyzer/frontend"

npm test
npm run test:ci
npm run test:coverage
npm run lint
npm run format
```

### Frontend: E2E Playwright

```powershell
cd "phishing-email-analyzer/frontend"
npx playwright install
npm run e2e
npm run e2e:ui
npm run e2e:headed
npm run e2e:report
```

## Format danych wejściowych (`data/data.json`)

Każdy rekord powinien zawierać pola:

- `id` (int)
- `title` (string)
- `sender` (string)
- `text` (string)
- `ground_truth` (`phishing` lub `legit`)
- `category` (string)

## Raporty

Folder `reports/` przechowuje raporty JSON z uruchomień modeli (np. `gpt_4.1_report_*.json`, `mistral_report_*.json`, `bielik2_(4bit)_report_*.json`).

## Zrzuty ekranu aplikacji

Poniżej wstaw zrzuty ekranu frontendu, aby pokazać czytelnikowi jak wygląda aplikacja.
Najwygodniej trzymać pliki w katalogu `forma_pisemna/images/` albo `phishing-email-analyzer/frontend/public/`.

### Ekran główny

Krótki opis: widok formularza do analizy wiadomości (pole treści, wybór modelu, przycisk analizy).

![Ekran główny aplikacji](forma_pisemna/images/frontend-home.png)

### Wynik analizy

Krótki opis: przykład wyniku klasyfikacji (`phishing`/`legit`), uzasadnienie modelu i czas odpowiedzi.

![Wynik analizy wiadomości](forma_pisemna/images/frontend-result.png)

### Widok mobilny (opcjonalnie)

Krótki opis: responsywność interfejsu na mniejszych ekranach.

![Widok mobilny aplikacji](forma_pisemna/images/frontend-mobile.png)

## Część pracy magisterskiej

Dokument LaTeX znajduje się w `forma_pisemna/`:

- `main.tex` - główny plik dokumentu
- `claims_page.tex`, `title_page.tex`, `settings.tex`
- `bibliografia.bib`
- `images/`

## Wskazówki operacyjne

- Najpierw uruchom backend, potem frontend.
- Jeśli frontend nie łączy się z API, sprawdź czy backend działa na `127.0.0.1:8000`.
- Jeśli model zwraca błąd, najpierw zweryfikuj odpowiedni klucz API w `.env`.
