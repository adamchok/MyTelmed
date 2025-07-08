'use client';

import { Card, Typography, Tag, Button, Tooltip, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, MedicineBoxOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ReferralCardProps } from '../props';

const { Text, Title } = Typography;

const ReferralCard: React.FC<ReferralCardProps> = ({
  referral,
  onViewDetails
}) => {
  const {
    id,
    type,
    referringDoctor,
    referringClinic,
    referralDate,
    expiryDate,
    status,
    description,
    specialty
  } = referral;

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

  // Format dates for better display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining for active referrals
  const calculateDaysRemaining = () => {
    if (status !== 'active') return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <Card
      className="w-full shadow-sm hover:shadow transition-shadow mb-4"
      data-testid={`referral-card-${id}`}
    >
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <Title level={5} className="m-0 text-blue-800">{type}</Title>
            <Tag color={getStatusColor(status)} className="ml-2">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-3">
            <div className="flex items-center mr-4">
              <UserOutlined className="mr-1" />
              <Text>Dr. {referringDoctor}</Text>
            </div>
            <div className="flex items-center">
              <MedicineBoxOutlined className="mr-1" />
              <Text>{referringClinic}</Text>
            </div>
            {specialty && (
              <div className="flex items-center ml-4">
                <FileTextOutlined className="mr-1" />
                <Text>{specialty}</Text>
              </div>
            )}
          </div>

          {description && (
            <Text className="block mb-3 text-sm text-gray-600 line-clamp-2" italic={true}>
              "{description}"
            </Text>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center">
              <CalendarOutlined className="mr-1 text-gray-600" />
              <Text type="secondary">Issued: {formatDate(referralDate)}</Text>
            </div>
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-1 text-gray-600" />
              <Text type="secondary">Expires: {formatDate(expiryDate)}</Text>
            </div>

            {status === 'active' && daysRemaining !== null && (
              <Text
                type={daysRemaining < 7 ? "danger" : "secondary"}
                strong={daysRemaining < 7}
                className="ml-auto"
              >
                {daysRemaining} days remaining
              </Text>
            )}
          </div>
        </div>

        <div className="mt-3 md:mt-0 md:ml-4 flex md:flex-col justify-end">
          <Tooltip title="View Details">
            <Button
              type="primary"
              icon={<InfoCircleOutlined />}
              onClick={() => onViewDetails(referral)}
              className="w-full"
            >
              Details
            </Button>
          </Tooltip>

          {status === 'active' && (
            <Space className="mt-2" direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                onClick={() => window.location.href = `/browse/doctors?referral=${id}`}
              >
                Book Appointment
              </Button>
            </Space>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReferralCard; 