import { useState } from 'react';
import { Button, Modal, Typography, Space } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import './ResetDialog.css';

const { Text, Paragraph } = Typography;

export function ResetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch } = useApp();

  const handleReset = () => {
    dispatch({ type: 'RESET_PROGRESS' });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={() => setIsOpen(true)}
        className="reset-button"
      >
        Reset Progress
      </Button>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span>Reset All Progress?</span>
          </Space>
        }
        open={isOpen}
        onOk={handleReset}
        onCancel={() => setIsOpen(false)}
        okText="Yes, Reset"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <Paragraph>This will permanently delete all your progress:</Paragraph>
        <ul>
          <li>All known words will be cleared</li>
          <li>All unknown words will be cleared</li>
          <li>Progress will reset to 0%</li>
          <li>Words will be reshuffled</li>
        </ul>
        <Text type="warning">This action cannot be undone.</Text>
      </Modal>
    </>
  );
}
