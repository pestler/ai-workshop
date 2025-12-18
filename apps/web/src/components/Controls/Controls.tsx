import { Button, Space, Tooltip } from 'antd';
import {
  CloseOutlined,
  CheckOutlined,
  ForwardOutlined,
} from '@ant-design/icons';
import './Controls.css';

interface ControlsProps {
  onKnow: () => void;
  onDontKnow: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function Controls({
  onKnow,
  onDontKnow,
  onSkip,
  disabled = false,
}: ControlsProps) {
  return (
    <Space size="large" className="controls-container">
      <Tooltip title="Don't know (←)">
        <Button
          type="primary"
          danger
          shape="circle"
          size="large"
          icon={<CloseOutlined />}
          onClick={onDontKnow}
          disabled={disabled}
          className="control-button dont-know-button"
        />
      </Tooltip>

      <Tooltip title="Skip (↑)">
        <Button
          shape="circle"
          size="large"
          icon={<ForwardOutlined />}
          onClick={onSkip}
          disabled={disabled}
          className="control-button skip-button"
        />
      </Tooltip>

      <Tooltip title="Know (→)">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<CheckOutlined />}
          onClick={onKnow}
          disabled={disabled}
          className="control-button know-button"
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
        />
      </Tooltip>
    </Space>
  );
}
