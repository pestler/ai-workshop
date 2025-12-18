/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles array elements in place
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get word IDs filtered by level and shuffle them
 */
export function getShuffledWordIds(
  words: { id: number; level: string }[],
  level: string
): number[] {
  const filteredWords =
    level === 'ALL' ? words : words.filter((w) => w.level === level);

  const ids = filteredWords.map((w) => w.id);
  return shuffle(ids);
}
