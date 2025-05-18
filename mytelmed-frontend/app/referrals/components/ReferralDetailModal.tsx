'use client';

import { Modal, Typography, Descriptions, Tag, Button, Divider } from 'antd';
import { ReferralDetailModalProps } from '../props';

const { Title, Text } = Typography;

const ReferralDetailModal: React.FC<ReferralDetailModalProps> = ({
  referral,
  isVisible,
  onClose
}) => {
  if (!referral) return null;

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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining for active referrals
  const calculateDaysRemaining = () => {
    if (referral.status !== 'active') return null;

    const today = new Date();
    const expiry = new Date(referral.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <Modal
      open={isVisible}
      title={<Title level={4} className="m-0">Referral Details</Title>}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        referral.status === 'active' && (
          <Button
            key="book"
            type="primary"
            onClick={() => window.location.href = `/browse/doctors?referral=${referral.id}`}
          >
            Book Appointment
          </Button>
        )
      ]}
    >
      <div className="py-2">
        <div className="flex justify-between items-center mb-4">
          <Title level={5} className="m-0">{referral.type}</Title>
          <Tag color={getStatusColor(referral.status)} className="text-base px-3 py-1">
            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
          </Tag>
        </div>

        {referral.status === 'active' && daysRemaining !== null && (
          <div className="mb-4 bg-blue-50 p-3 rounded">
            <Text
              type={daysRemaining < 7 ? "danger" : "success"}
              strong
            >
              {daysRemaining} days remaining until expiry
            </Text>
          </div>
        )}

        <Divider className="my-4" />

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Referring Doctor" span={2}>
            Dr. {referral.referringDoctor}
          </Descriptions.Item>
          <Descriptions.Item label="Referring Clinic" span={2}>
            {referral.referringClinic}
          </Descriptions.Item>
          {referral.specialty && (
            <Descriptions.Item label="Specialty" span={2}>
              {referral.specialty}
            </Descriptions.Item>
          )}
          {referral.issuedFor && (
            <Descriptions.Item label="Issued For" span={2}>
              {referral.issuedFor}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Issued Date">
            {formatDate(referral.referralDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Expiry Date">
            {formatDate(referral.expiryDate)}
          </Descriptions.Item>
        </Descriptions>

        {referral.description && (
          <>
            <Divider className="my-4" />
            <div>
              <Text strong>Description:</Text>
              <div className="bg-gray-50 p-3 rounded mt-2">
                <Text>{referral.description}</Text>
              </div>
            </div>
          </>
        )}

        {referral.status === 'used' && (
          <>
            <Divider className="my-4" />
            <div className="bg-gray-100 p-3 rounded">
              <Text strong className="block mb-1">Usage Information:</Text>
              <Text type="secondary">
                This referral has been used for an appointment. It cannot be used again.
              </Text>
            </div>
          </>
        )}

        {referral.status === 'expired' && (
          <>
            <Divider className="my-4" />
            <div className="bg-red-50 p-3 rounded">
              <Text type="danger" strong className="block mb-1">Expired Referral:</Text>
              <Text type="secondary">
                This referral has expired and can no longer be used. Please contact your doctor for a new referral if needed.
              </Text>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ReferralDetailModal; 