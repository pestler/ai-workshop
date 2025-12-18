import { Row, Col, Card, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ForwardOutlined,
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import './Statistics.css';

export function Statistics() {
  const { state } = useApp();

  return (
    <Row gutter={[16, 16]} className="statistics-container">
      <Col xs={8}>
        <Card size="small" className="stat-card stat-known">
          <Statistic
            title="Known"
            value={state.knownWordIds.length}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={8}>
        <Card size="small" className="stat-card stat-unknown">
          <Statistic
            title="Unknown"
            value={state.unknownWordIds.length}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col xs={8}>
        <Card size="small" className="stat-card stat-skipped">
          <Statistic
            title="Skipped"
            value={state.skippedWordIds.length}
            prefix={<ForwardOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
