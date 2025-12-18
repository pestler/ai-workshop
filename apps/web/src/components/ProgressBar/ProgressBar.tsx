import { Progress, Typography } from 'antd';
import { useApp } from '../../context/AppContext';
import './ProgressBar.css';

const { Text } = Typography;

export function ProgressBar() {
  const { state } = useApp();

  const total = state.shuffledQueue.length;
  const reviewed =
    state.knownWordIds.length +
    state.unknownWordIds.length +
    state.skippedWordIds.length;
  const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="progress-bar-container">
      <Progress
        percent={percent}
        status="active"
        strokeColor={{
          '0%': '#1890ff',
          '100%': '#52c41a',
        }}
        trailColor="#f0f0f0"
      />
      <Text type="secondary" className="progress-text">
        {reviewed} / {total} words reviewed
      </Text>
    </div>
  );
}
