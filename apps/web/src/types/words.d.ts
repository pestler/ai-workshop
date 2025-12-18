declare module '*.json' {
  const value: {
    metadata: {
      source: string;
      description: string;
      totalWords: number;
      levels: Record<string, { count: number; description: string }>;
    };
    words: Array<{
      id: number;
      word: string;
      pos: string;
      level: 'A1' | 'A2' | 'B1' | 'B2';
    }>;
  };
  export default value;
}
