import { Tag } from 'antd';
import { useSwipe } from '../../hooks/useSwipe';
import type { Word } from '../../types';
import './SwipeCard.css';

interface SwipeCardProps {
  word: Word;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
}

const levelColors: Record<string, string> = {
  A1: '#52c41a',
  A2: '#73d13d',
  B1: '#1890ff',
  B2: '#722ed1',
};

export function SwipeCard({
  word,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: SwipeCardProps) {
  const { swipeState, transform, handlers } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
  });

  const getDirectionClass = () => {
    if (swipeState.isExiting) {
      if (swipeState.exitDirection === 'right') return 'exiting-right';
      if (swipeState.exitDirection === 'left') return 'exiting-left';
      if (swipeState.exitDirection === 'up') return 'exiting-up';
    }
    if (!swipeState.isDragging) return '';
    if (swipeState.direction === 'right') return 'swiping-right';
    if (swipeState.direction === 'left') return 'swiping-left';
    if (swipeState.direction === 'up') return 'swiping-up';
    return '';
  };

  return (
    <div
      className={`swipe-card ${swipeState.isDragging ? 'dragging' : ''} ${getDirectionClass()}`}
      style={{ transform }}
      {...handlers}
    >
      {/* Direction indicators */}
      <div className="direction-indicator know-indicator">KNOW</div>
      <div className="direction-indicator dont-know-indicator">DON'T KNOW</div>
      <div className="direction-indicator skip-indicator">SKIP</div>

      {/* Card content */}
      <div className="card-content">
        <Tag color={levelColors[word.level]} className="level-badge">
          {word.level}
        </Tag>
        <h2 className="word-text">{word.word}</h2>
        <p className="word-pos">{word.pos}</p>
      </div>
    </div>
  );
}
