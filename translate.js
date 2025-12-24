const fs = require('fs');
const translate = require('@iamtraction/google-translate');

const BATCH_SIZE = 20;
const TARGET_TRANSLATIONS = 2000;
const SOURCE_FILE = 'The_Oxford_3000_by_CEFR_level.json';
const DEST_FILE = 'Oxford_3000_RU_Node.json';

async function processBatch() {
  // Read the destination file
  const rawData = fs.readFileSync(DEST_FILE);
  const data = JSON.parse(rawData);

  // Collect all words that need translation
  const wordsToTranslate = [];
  const levels = Object.keys(data);
  for (const level of levels) {
    for (const item of data[level]) {
      if (!item.russian_translation || item.russian_translation.trim() === '') {
        wordsToTranslate.push(item);
      }
    }
  }

  // If there are no words to translate, we're done
  if (wordsToTranslate.length === 0) {
    console.log('Все слова уже переведены. Отличная работа!');
    return 0; // Return 0 translated words in this batch
  }

  console.log(`Найдено ${wordsToTranslate.length} слов для перевода. Начинаем обработку партии из ${BATCH_SIZE} слов...`);

  // Get the next batch of words
  const batch = wordsToTranslate.slice(0, BATCH_SIZE);
  let translatedInBatch = 0;

  // Process the batch
  for (const item of batch) {
    try {
      let query = item.english_word;
      if (item.pos && item.pos.includes('v.') && !item.pos.includes('n.')) {
        query = `to ${item.english_word}`;
      }

      const res = await translate(query, { from: 'en', to: 'ru' });
      
      let translation = res.text.toLowerCase();
      if (translation.startsWith('to ')) {
        translation = translation.substring(3);
      }
      if (translation.startsWith('в ')) {
        translation = translation.substring(2);
      }
      if (translation.startsWith('чтобы ')) {
        translation = translation.substring(6);
      }

      item.russian_translation = translation;
      translatedInBatch++;
      console.log(`- Переведено: '${item.english_word}' -> '${translation}'`);

    } catch (err) {
      console.error(`Ошибка при переводе слова '${item.english_word}':`, err);
      // Mark as empty to avoid retrying constantly on error
      item.russian_translation = ""; 
    }
  }

  // Save the updated data back to the file
  fs.writeFileSync(DEST_FILE, JSON.stringify(data, null, 2));
  const remaining = wordsToTranslate.length - batch.length;
  console.log(`\nПартия обработана! Сохранено в ${DEST_FILE}.`);
  console.log(`Осталось перевести: ${remaining} слов.`);
  return translatedInBatch;
}

async function main() {
  // Ensure the destination file exists
  if (!fs.existsSync(DEST_FILE)) {
    console.log(`Файл ${DEST_FILE} не найден, создаем его из ${SOURCE_FILE}...`);
    fs.copyFileSync(SOURCE_FILE, DEST_FILE);
  }

  while (true) {
    // Count currently translated words
    const rawData = fs.readFileSync(DEST_FILE);
    const data = JSON.parse(rawData);
    let currentTranslatedCount = 0;
    const levels = Object.keys(data);
    for (const level of levels) {
      for (const item of data[level]) {
        if (item.russian_translation && item.russian_translation.trim() !== '') {
          currentTranslatedCount++;
        }
      }
    }

    console.log(`\nТекущее количество переведенных слов: ${currentTranslatedCount}`);

    if (currentTranslatedCount >= TARGET_TRANSLATIONS) {
      console.log(`Достигнута цель: ${TARGET_TRANSLATIONS} слов переведено!`);
      break;
    }

    const translatedInBatch = await processBatch();
    if (translatedInBatch === 0) {
      console.log('Нет новых слов для перевода в этой партии. Завершение.');
      break;
    }

    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main();
