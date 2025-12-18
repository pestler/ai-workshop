# Oxford 3000 Learning Ecosystem

Экосистема приложений для изучения английских слов из списка Oxford 3000.

## Обзор проекта

Проект состоит из двух приложений:

1. **Web App** (`apps/web`) - React приложение для тестирования словарного запаса в стиле Tinder
2. **Telegram Bot** (`apps/telegram-bot`) - бот для интервального повторения слов (в разработке)

## Структура монорепозитория

```
ai-workshop/
├── apps/
│   ├── web/                    # React веб-приложение
│   │   ├── docs/               # Документация web app
│   │   ├── src/                # Исходный код
│   │   └── package.json
│   │
│   └── telegram-bot/           # Telegram бот (в разработке)
│       ├── docs/               # Документация бота
│       └── src/
│
├── shared/                     # Общие ресурсы
│   └── data/
│       └── words.json          # База слов Oxford 3000
│
├── docs/                       # Общая документация
│   └── README.md               # Этот файл
│
└── The_Oxford_3000_by_CEFR_level.pdf  # Исходный PDF
```

## Быстрый старт

### Web App

```bash
cd apps/web
npm install
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173

## База слов

Общая база слов находится в `shared/data/words.json` и содержит:
- 3000 слов из списка Oxford 3000
- Уровни CEFR: A1, A2, B1, B2
- Части речи для каждого слова

### Формат данных

```json
{
  "metadata": {
    "source": "The Oxford 3000",
    "description": "The Oxford 3000 is the list of the 3000 most important words to learn in English",
    "totalWords": 3000,
    "levels": {
      "A1": { "count": 599, "description": "Beginner" },
      "A2": { "count": 869, "description": "Elementary" },
      "B1": { "count": 995, "description": "Intermediate" },
      "B2": { "count": 537, "description": "Upper-Intermediate" }
    }
  },
  "words": [
    {
      "id": 1,
      "word": "a",
      "pos": "indefinite article",
      "level": "A1"
    }
  ]
}
```

## Технологический стек

### Web App
- React 18 + TypeScript
- Vite
- Ant Design
- jsPDF
- LocalStorage

### Telegram Bot (планируется)
- Python
- python-telegram-bot
- SQLite

## Уровни CEFR

| Уровень | Название | Описание |
|---------|----------|----------|
| A1 | Beginner | Базовая лексика для повседневных ситуаций |
| A2 | Elementary | Слова для простых разговоров |
| B1 | Intermediate | Лексика для работы, учебы и путешествий |
| B2 | Upper-Intermediate | Продвинутая лексика для сложных тем |

## Лицензия

Образовательный проект. Список слов Oxford 3000 является собственностью Oxford University Press.
