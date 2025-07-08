'use client';

import { Radio, Card, Empty, Space, Typography, Tag } from 'antd';
import { ReferralSelectorProps } from '../props';

const { Text } = Typography;

const ReferralSelector: React.FC<ReferralSelectorProps> = ({
  referrals,
  selectedReferral,
  onSelectReferral
}) => {
  const handleReferralSelect = (referralId: string) => {
    onSelectReferral(referralId);
  };

  if (referrals.length === 0) {
    return <Empty description="No referrals found" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'used':
        return 'gray';
      default:
        return 'blue';
    }
  };

  return (
    <div className="mt-3">
      <Radio.Group
        onChange={(e) => handleReferralSelect(e.target.value)}
        value={selectedReferral}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          {referrals.map((referral) => (
            <Card
              key={referral.id}
              className={`w-full border ${selectedReferral === referral.id ? 'border-blue-500' : 'border-gray-200'}`}
              hoverable
            >
              <Radio value={referral.id} className="w-full">
                <div className="ml-2">
                  <div className="flex items-center justify-between">
                    <Text strong>{referral.type}</Text>
                    <Tag color={getStatusColor(referral.status)}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Tag>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <div>From: Dr. {referral.referringDoctor}</div>
                    <div>{referral.referringClinic}</div>
                    <div className="mt-1 flex justify-between">
                      <span>Issued: {referral.referralDate}</span>
                      <span>Expires: {referral.expiryDate}</span>
                    </div>
                  </div>
                  {referral.description && (
                    <div className="mt-2 pt-2 border-t text-sm">
                      {referral.description}
                    </div>
                  )}
                </div>
              </Radio>
            </Card>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default ReferralSelector; 