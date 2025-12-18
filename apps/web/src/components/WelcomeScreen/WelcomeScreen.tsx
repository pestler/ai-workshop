import { Card, Typography, Button, Space, Tag } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import type { LevelFilter } from '../../types';
import './WelcomeScreen.css';

const { Title, Text, Paragraph } = Typography;

interface LevelOption {
  level: LevelFilter;
  title: string;
  description: string;
  color: string;
  count?: number;
}

const levelOptions: LevelOption[] = [
  {
    level: 'A1',
    title: 'A1 - Beginner',
    description: 'Basic vocabulary for everyday situations',
    color: '#52c41a',
  },
  {
    level: 'A2',
    title: 'A2 - Elementary',
    description: 'Common words for simple conversations',
    color: '#73d13d',
  },
  {
    level: 'B1',
    title: 'B1 - Intermediate',
    description: 'Words for work, school, and travel',
    color: '#1890ff',
  },
  {
    level: 'B2',
    title: 'B2 - Upper-Intermediate',
    description: 'Advanced vocabulary for complex topics',
    color: '#722ed1',
  },
  {
    level: 'ALL',
    title: 'All Levels',
    description: 'Complete Oxford 3000 word list',
    color: '#eb2f96',
  },
];

export function WelcomeScreen() {
  const { state, dispatch } = useApp();

  const getWordCount = (level: LevelFilter): number => {
    if (level === 'ALL') return state.allWords.length;
    return state.allWords.filter((w) => w.level === level).length;
  };

  const handleSelectLevel = (level: LevelFilter) => {
    dispatch({ type: 'SET_LEVEL', level });
  };

  const handleStart = () => {
    dispatch({ type: 'START_TEST' });
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-header">
        <Title level={2}>Oxford 3000 Vocabulary Test</Title>
        <Paragraph type="secondary">
          Test your knowledge of the 3000 most important English words.
          <br />
          Swipe right if you know the word, left if you don't.
        </Paragraph>
      </div>

      <div className="level-selection">
        <Title level={4}>Select your level:</Title>
        <div className="level-cards">
          {levelOptions.map((option) => (
            <Card
              key={option.level}
              className={`level-card ${state.selectedLevel === option.level ? 'selected' : ''}`}
              onClick={() => handleSelectLevel(option.level)}
              hoverable
            >
              <Tag color={option.color} className="level-tag">
                {option.level}
              </Tag>
              <Title level={5}>{option.title}</Title>
              <Text type="secondary">{option.description}</Text>
              <div className="word-count">
                <Text strong>{getWordCount(option.level)}</Text>
                <Text type="secondary"> words</Text>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="start-section">
        <Button
          type="primary"
          size="large"
          icon={<RocketOutlined />}
          onClick={handleStart}
          disabled={state.allWords.length === 0}
        >
          Start Test
        </Button>
        <Space direction="vertical" size={0} className="keyboard-hint">
          <Text type="secondary">Keyboard shortcuts:</Text>
          <Text type="secondary">← Don't know | → Know | ↑ Skip</Text>
        </Space>
      </div>
    </div>
  );
}
