import { useCallback } from 'react';
import { Layout, Typography, Result, Button, Space } from 'antd';
import { TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import { useKeyboard } from '../../hooks/useKeyboard';
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import { SwipeCard } from '../SwipeCard/SwipeCard';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Statistics } from '../Statistics/Statistics';
import { Controls } from '../Controls/Controls';
import { ResetDialog } from '../ResetDialog/ResetDialog';
import { ExportButton } from '../ExportButton/ExportButton';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export function App() {
  const { state, dispatch, currentWord, isComplete } = useApp();

  // Action handlers
  const handleKnow = useCallback(() => {
    if (currentWord) {
      dispatch({ type: 'MARK_KNOWN', wordId: currentWord.id });
    }
  }, [currentWord, dispatch]);

  const handleDontKnow = useCallback(() => {
    if (currentWord) {
      dispatch({ type: 'MARK_UNKNOWN', wordId: currentWord.id });
    }
  }, [currentWord, dispatch]);

  const handleSkip = useCallback(() => {
    if (currentWord) {
      dispatch({ type: 'SKIP_WORD', wordId: currentWord.id });
    }
  }, [currentWord, dispatch]);

  const handleRestart = () => {
    dispatch({ type: 'RESET_PROGRESS' });
  };

  // Keyboard controls
  useKeyboard(
    {
      onLeft: handleDontKnow,
      onRight: handleKnow,
      onUp: handleSkip,
      onSpace: handleSkip,
    },
    state.isStarted && !isComplete
  );

  // Not started - show welcome screen
  if (!state.isStarted) {
    return (
      <Layout className="app-layout">
        <Header className="app-header">
          <Title level={3} className="header-title">
            Oxford 3000
          </Title>
        </Header>
        <Content className="app-content">
          <WelcomeScreen />
        </Content>
        <Footer className="app-footer">
          <Text type="secondary">
            Oxford 3000 Vocabulary Test
          </Text>
        </Footer>
      </Layout>
    );
  }

  // Completed - show results
  if (isComplete) {
    const total = state.shuffledQueue.length;
    const knownPercent = Math.round(
      (state.knownWordIds.length / total) * 100
    );

    return (
      <Layout className="app-layout">
        <Header className="app-header">
          <Title level={3} className="header-title">
            Oxford 3000
          </Title>
        </Header>
        <Content className="app-content">
          <Result
            icon={<TrophyOutlined style={{ color: '#52c41a' }} />}
            title="Test Complete!"
            subTitle={`You know ${knownPercent}% of the words (${state.knownWordIds.length}/${total})`}
            extra={
              <Space direction="vertical" size="middle">
                <Statistics />
                <Space>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRestart}
                  >
                    Start New Test
                  </Button>
                </Space>
                <ExportButton />
              </Space>
            }
          />
        </Content>
        <Footer className="app-footer">
          <Text type="secondary">
            Oxford 3000 Vocabulary Test
          </Text>
        </Footer>
      </Layout>
    );
  }

  // In progress - show card
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title level={3} className="header-title">
          Oxford 3000
        </Title>
      </Header>
      <Content className="app-content">
        <ProgressBar />
        <Statistics />

        <div className="card-area">
          {currentWord && (
            <SwipeCard
              key={currentWord.id}
              word={currentWord}
              onSwipeLeft={handleDontKnow}
              onSwipeRight={handleKnow}
              onSwipeUp={handleSkip}
            />
          )}
        </div>

        <Controls
          onKnow={handleKnow}
          onDontKnow={handleDontKnow}
          onSkip={handleSkip}
          disabled={!currentWord}
        />

        <div className="action-buttons">
          <ExportButton />
          <ResetDialog />
        </div>
      </Content>
      <Footer className="app-footer">
        <Text type="secondary">← Don't know | → Know | ↑ Skip</Text>
      </Footer>
    </Layout>
  );
}
