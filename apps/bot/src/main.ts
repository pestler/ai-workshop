import { Context, Telegraf, Markup } from 'telegraf';
import 'dotenv/config';
import { 
  initializeDatabase, 
  addWord, 
  getWordByEnglish, 
  associateWordWithUser,
  getWordForReview,
  updateUserWordProgress,
  getUsersWithDueWords,
  getUserStats,
  WordStatus,
  getOrCreateUser,
  updateUserStatus,
  updateUserLastMessage,
} from './db';import { Database } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * ----------------------------------------------------------------
 * 👋Привет! Это базовый код для вашего Telegram-бота.
 *
 * Чтобы он заработал, вам нужно:
 * 1. Создать файл с именем `.env` в этой же папке (`apps/bot`).
 * 2. Добавить в него ваш токен, полученный от @BotFather, в таком формате:
 *    BOT_TOKEN="12345:your-very-long-token"
 * ----------------------------------------------------------------
 */

interface MyContext extends Context {
  db: Database;
}

if (!process.env.BOT_TOKEN) {
  console.error('Ошибка: Токен для бота не найден. Пожалуйста, создайте файл .env и добавьте в него BOT_TOKEN.');
  process.exit(1);
}

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);

// Initialize database and attach to bot context
(async () => {
  try {
    const db = await initializeDatabase();
    bot.context.db = db;
    console.log('База данных успешно подключена.');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
})();

// --- Helper Functions ---

function escapeMarkdownV2(text: string): string {
  // List of characters to escape in MarkdownV2
  const charsToEscape = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  return charsToEscape.reduce((acc, char) => acc.replace(new RegExp('\\' + char, 'g'), '\\' + char), text);
}

function getExampleSentence(word: string): string {
  const templates = [
    `Can you use "{word}" in a sentence?`,
    `She wanted to learn the meaning of "{word}".`,
    `He looked up "{word}" in the dictionary.`,
    `The word "{word}" is very common in English.`,
    `Let's practice using the word "{word}".`
  ];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex].replace('{word}', word);
}

async function sendWordForReview(ctx: MyContext): Promise<any> {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('Не могу определить ваш ID пользователя.');
  }
  
  const user = await getOrCreateUser(userId);

  // Try to delete the previous message to keep the chat clean
  if (user.last_word_message_id) {
    try {
      await ctx.deleteMessage(user.last_word_message_id);
    } catch (e) {
      console.warn(`Could not delete message ${user.last_word_message_id} for user ${userId}. It might have been deleted already.`);
    }
  }

  const word = await getWordForReview(userId);

  if (!word) {
    // Session is over, clear the last message id
    await updateUserLastMessage(userId, null);
    return ctx.reply('🎉 Поздравляю! На сегодня слов для изучения больше нет.');
  }

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('😰 Сложно', `rate:hard:${word.id}`),
      Markup.button.callback('🤔 Нормально', `rate:okay:${word.id}`),
    ],
    [
      Markup.button.callback('👍 Хорошо', `rate:good:${word.id}`),
      Markup.button.callback('😎 Легко', `rate:easy:${word.id}`),
    ]
  ]);
  
  const translation = escapeMarkdownV2(word.russian_translation || 'Перевод отсутствует');
  const englishWord = escapeMarkdownV2(word.english_word);
  const exampleSentence = escapeMarkdownV2(getExampleSentence(word.english_word));

  // Using MarkdownV2 for the spoiler effect
  const message = `${exampleSentence}\n\nСлово: *${englishWord}*\n\n||${translation}||`;

  const sentMessage = await ctx.reply(message, { parse_mode: 'MarkdownV2', ...keyboard });
  await updateUserLastMessage(userId, sentMessage.message_id);
}


// --- Bot Commands ---

bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) {
    await getOrCreateUser(userId);
  }
  return ctx.reply('Добро пожаловать! Отправьте /help, чтобы увидеть список команд.');
});

bot.help((ctx) => ctx.reply(
  'Команды:\n' +
  '/learn - начать сессию изучения\n' +
  '/stats - посмотреть вашу статистику\n' +
  '/pause - приостановить автоматические уведомления\n' +
  '/resume - возобновить автоматические уведомления\n' +
  '/importwords [JSON] - импорт вашего списка слов\n' +
  '/import_all_words - импорт всех 3000 слов'
));

bot.command('pause', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('Не могу определить ваш ID.');
  }
  await getOrCreateUser(userId);
  await updateUserStatus(userId, 'paused');
  return ctx.reply('🤖 Уведомления приостановлены. Вы не будете получать напоминания. Используйте /resume, чтобы возобновить.');
});

bot.command('resume', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('Не могу определить ваш ID.');
  }
  await getOrCreateUser(userId);
  await updateUserStatus(userId, 'active');
  return ctx.reply('✅ Уведомления возобновлены. Бот снова будет присылать напоминания о словах для изучения.');
});

bot.command('learn', async (ctx) => {
  try {
    return await sendWordForReview(ctx);
  } catch (error) {
    console.error('Unhandled error in /learn command:', error);
    return ctx.reply('Произошла непредвиденная ошибка при получении слова. Попробуйте еще раз.');
  }
});

bot.command('stats', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('Не могу определить ваш ID пользователя для получения статистики.');
  }
  
  try {
    await getOrCreateUser(userId);
    const stats = await getUserStats(userId);
    const message = `*Ваша статистика*\n\n🧠 На изучении: ${stats.learning}\n✅ Изучено: ${stats.mastered}\n📖 Новые: ${stats.unknown}\n\n*Всего слов в словаре: ${stats.total}*`;
    return ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return ctx.reply('Не удалось получить статистику. Попробуйте позже.');
  }
});

// New /importwords command for user-specified words
bot.command('importwords', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('Не могу определить ваш ID пользователя для импорта.');
  }
  await getOrCreateUser(userId);

  const text = ctx.message.text.replace('/importwords ', '').trim();
  if (!text) {
    return ctx.reply('Пожалуйста, укажите список слов в формате JSON массива. Пример: `/importwords ["apple", "banana"]`');
  }

  let wordsToImport: string[] = [];
  try {
    wordsToImport = JSON.parse(text);
    if (!Array.isArray(wordsToImport) || !wordsToImport.every(w => typeof w === 'string')) {
      throw new Error('Неверный формат JSON. Ожидается массив строк.');
    }
  } catch (error) {
    return ctx.reply(`Ошибка при разборе JSON: ${error instanceof Error ? error.message : String(error)}. Пример: 
/importwords ["apple", "banana"]`);
  }

  let addedCount = 0;
  let associatedCount = 0;

  await ctx.reply(`Начинаю импорт ${wordsToImport.length} слов.`);

  for (const englishWord of wordsToImport) {
    if (englishWord) {
      let word = await getWordByEnglish(englishWord);
      if (!word) {
        const newWord = await addWord({ english_word: englishWord, russian_translation: 'RU ' + englishWord });
        if(newWord) {
          word = newWord;
          addedCount++;
        }
      }
      
      if (word && word.id) {
        await associateWordWithUser(userId, word.id);
        associatedCount++;
      }
    }
  }

  return ctx.reply(`Импорт завершен!
Добавлено новых слов в глобальный словарь: ${addedCount}
Связано слов с вашим профилем: ${associatedCount}`);
});


// Renamed command for importing all 3000 words
bot.command('import_all_words', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.reply('Не могу определить ваш ID пользователя для импорта.');
  }
  await getOrCreateUser(userId);

  const wordsJsonPath = path.join(process.cwd(), 'The_Oxford_3000_by_CEFR_level.json');

  try {
    const data = await fs.readFile(wordsJsonPath, 'utf8');
    const wordsByLevel = JSON.parse(data);
    const allWords = Object.values(wordsByLevel).flat() as any[];

    if (!allWords || allWords.length === 0) {
      return ctx.reply('Ошибка: Неверный формат файла слов или файл пуст.');
    }

    let addedCount = 0;
    let associatedCount = 0;

    await ctx.reply(`Начинаю импорт ${allWords.length} слов. Это может занять некоторое время...`);

    for (const wordEntry of allWords) {
      if (wordEntry.english_word) {
        let word = await getWordByEnglish(wordEntry.english_word);
        if (!word) {
          const newWord = await addWord({ english_word: wordEntry.english_word, russian_translation: 'RU ' + wordEntry.english_word });
          if(newWord) {
            word = newWord;
            addedCount++;
          }
        }
        
        if (word && word.id) {
          await associateWordWithUser(userId, word.id);
          associatedCount++;
        }
      }
    }

    return ctx.reply(`Импорт завершен!
Добавлено новых слов в глобальный словарь: ${addedCount}
Связано слов с вашим профилем: ${associatedCount}`);

  } catch (error) {
    console.error('Ошибка при импорте слов:', error);
    return ctx.reply('Произошла ошибка при импорте слов. Проверьте, существует ли файл The_Oxford_3000_by_CEFR_level.json.');
  }
});


// --- Callback Handlers ---

const RATING_INTERVALS_MINUTES: Record<string, number> = {
  hard: 10,
  okay: 24 * 60,      // 1 день
  good: 3 * 24 * 60,  // 3 дня
  easy: 7 * 24 * 60,  // 7 дней
};

bot.action(/rate:(\w+):(\d+)/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return ctx.answerCbQuery('Не могу определить ваш ID.');
  }

  const rating = ctx.match[1];
  const wordId = parseInt(ctx.match[2], 10);
  const intervalMinutes = RATING_INTERVALS_MINUTES[rating];

  if (intervalMinutes === undefined) {
    return ctx.answerCbQuery('Неизвестная оценка!');
  }

  try {
    const newStatus: WordStatus = rating === 'easy' ? 'mastered' : 'learning';
    await updateUserWordProgress(userId, wordId, newStatus, intervalMinutes);
    
    // The message is deleted by sendWordForReview, so we don't need to edit it.
    // We just need to answer the callback query to stop the loading animation on the button.
    await ctx.answerCbQuery(`Следующий повтор через ${Math.round(intervalMinutes/60/24)} д.`);
    
    // Automatically send the next word
    return sendWordForReview(ctx);

  } catch (error) {
    console.error('Ошибка при обновлении прогресса слова:', error);
    return ctx.answerCbQuery('Ошибка при обновлении слова.');
  }
});


// --- Scheduler ---
const activeNotifications = new Set<number>();

setInterval(async () => {
  try {
    const userIds = await getUsersWithDueWords();
    for (const userId of userIds) {
      // Avoid spamming users who might already have a notification
      if (activeNotifications.has(userId)) {
        continue;
      }

      console.log(`Sending review notification to user ${userId}`);
      await bot.telegram.sendMessage(userId, 'У вас есть слова для повторения! Нажмите /learn, чтобы начать.');
      activeNotifications.add(userId);
      // Remove from set after some time to allow re-notification
      setTimeout(() => activeNotifications.delete(userId), 5 * 60 * 1000); // 5 minutes
    }
  } catch (error) {
    console.error('Error in scheduler:', error);
  }
}, 60 * 1000); // Check every minute


// --- Launch ---

bot.launch();

// Включаем graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('🤖 Бот успешно запущен!');