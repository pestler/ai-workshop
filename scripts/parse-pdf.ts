import fs from 'fs/promises';
import path from 'path';

interface ParsedWord {
  english_word: string;
  pos?: string;
  level: string;
}

async function parseTextFile() {
  const textPath = path.resolve(__dirname, '../The_Oxford_3000_by_CEFR_level.txt');
  console.log(`Reading text from: ${textPath}`);

  try {
    const data = await fs.readFile(textPath, 'utf8');
    const lines = data.split('\n');

    const parsedWords: ParsedWord[] = [];
    let currentLevel: string = 'UNKNOWN';
    let wordCount = 0;

    // Regex to identify CEFR level headings (e.g., "A1", "A2", etc.)
    const strictCefrLevelRegex = /^(A1|A2|B1|B2)\s*$/;
    const cefrLevelAtStartRegex = /^(A1|A2|B1|B2)\s*/;

    // Robust regex to extract word and part of speech from a single column chunk
    // It captures the word part (can include commas, hyphens) and then the POS part (starts with a letter, can include commas, dots, spaces)
    const wordPosExtractorRegex = /^([\p{L}\d\s'’",\/-]+?)\s+([a-z].*)$/u; // 'u' flag for Unicode

    let parsingActive = false; // Flag to indicate if we are past initial headers/metadata

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (trimmedLine.length === 0) {
        continue;
      }

      // Skip explicit header/footer lines regardless of position
      if (trimmedLine.includes('Oxford University Press') ||
          trimmedLine.includes('The Oxford 3000™') ||
          trimmedLine.includes('CEFR level') ||
          /^\d+\s*\/\s*\d+$/.test(trimmedLine) // Page numbers
      ) {
        continue;
      }

      // --- CEFR Level Detection ---
      // 1. Check for strict CEFR level match on its own line
      const strictLevelMatch = trimmedLine.match(strictCefrLevelRegex);
      if (strictLevelMatch) {
        if (currentLevel !== strictLevelMatch[1]) {
          currentLevel = strictLevelMatch[1];
          console.log(`--- Level changed to: ${currentLevel} (from strict match) ---`);
          parsingActive = true; // Start parsing words from now on
        }
        continue; // This line was just a level marker
      }

      // Only start processing lines for words after the first CEFR level has been identified
      if (!parsingActive) {
        continue;
      }

      let lineToProcessForWords = trimmedLine;
      // 2. Check for CEFR level at the start of a line, possibly with words following
      const levelAtStartMatch = trimmedLine.match(cefrLevelAtStartRegex);
      if (levelAtStartMatch && levelAtStartMatch[1] !== currentLevel) { // Only update if it's a new level
          currentLevel = levelAtStartMatch[1];
          console.log(`--- Level changed to: ${currentLevel} (from line start) ---`);
          lineToProcessForWords = trimmedLine.substring(levelAtStartMatch[0].length).trim();
      } else if (levelAtStartMatch && levelAtStartMatch[1] === currentLevel) {
          // Level is at start but it's the same as currentLevel, just strip it for processing words
          lineToProcessForWords = trimmedLine.substring(levelAtStartMatch[0].length).trim();
      }
      
      // Split the line into potential columns based on multiple spaces
      const columns = lineToProcessForWords.split(/\s{2,}/).filter(col => col.length > 0);
      
      for (const column of columns) {
        // Filter out known noise that might appear as a "column"
        if (column.includes('Oxford 3000') || column.includes('CEFR level')) {
          continue;
        }

        const match = column.match(wordPosExtractorRegex);
        if (match) {
          const englishWord = match[1].trim();
          const pos = match[2].trim();
          
          parsedWords.push({
            english_word: englishWord,
            pos: pos,
            level: currentLevel,
          });
          wordCount++;
        } else {
          // console.warn(`Could not parse column chunk: "${column}" (Current Level: ${currentLevel}) in line: "${trimmedLine}"`);
        }
      }
    }

    const resultJson: { [key: string]: ParsedWord[] } = {
      A1: [], A2: [], B1: [], B2: []
    };
    parsedWords.forEach(word => {
      if (resultJson[word.level]) {
        resultJson[word.level].push(word);
      }
    });

    const outputPath = path.resolve(__dirname, '../The_Oxford_3000_by_CEFR_level.json');
    await fs.writeFile(outputPath, JSON.stringify(resultJson, null, 2), 'utf8');
    console.log(`Successfully wrote parsed words to ${outputPath}`);
    
  } catch (error) {
    console.error('Error parsing text file:', error);
  }
}

parseTextFile();