import { useEffect } from 'react';
import { Button, Space, Typography } from 'antd';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import { SyncStatus } from '@/apollo/client/graphql/__types__';
import { useDeployMutation } from '@/apollo/client/graphql/deploy.generated';
import { useDeployStatusContext } from '@/components/deploy/Context';

const { Text } = Typography;

const getDeployStatus = (deploying: boolean, status: SyncStatus) => {
  const syncStatus = deploying ? SyncStatus.IN_PROGRESS : status;

  return (
    {
      [SyncStatus.IN_PROGRESS]: (
        <Space size={[4, 0]}>
          <LoadingOutlined className="mr-1 gray-1" />
          <Text className="gray-1">Deploying...</Text>
        </Space>
      ),
      [SyncStatus.SYNCRONIZED]: (
        <Space size={[4, 0]}>
          <CheckCircleOutlined className="mr-1 green-7" />
          <Text className="gray-1">Synced</Text>
        </Space>
      ),
      [SyncStatus.UNSYNCRONIZED]: (
        <Space size={[4, 0]}>
          <WarningOutlined className="mr-1 gold-6" />
          <Text className="gray-1">Undeployed changes</Text>
        </Space>
      ),
    }[syncStatus] || ''
  );
};

export default function Deploy() {
  const deployContext = useDeployStatusContext();
  const [deployMutation, { loading: deploying }] = useDeployMutation();

  const { data, loading, startPolling, stopPolling } = deployContext;

  const syncStatus = data?.modelSync.status;

  const onDeploy = () => {
    deployMutation();
    startPolling(1000);
  };

  useEffect(() => {
    if (syncStatus === SyncStatus.SYNCRONIZED) stopPolling();
  }, [syncStatus]);

  const disabled =
    deploying ||
    loading ||
    [SyncStatus.SYNCRONIZED, SyncStatus.IN_PROGRESS].includes(syncStatus);

  return (
    <Space size={[8, 0]}>
      {getDeployStatus(deploying, syncStatus)}
      <Button
        className={`adm-modeling-header-btn ${disabled ? '' : 'gray-10'}`}
        disabled={disabled}
        onClick={() => onDeploy()}
        size="small"
      >
        Deploy
      </Button>
    </Space>
  );
}
