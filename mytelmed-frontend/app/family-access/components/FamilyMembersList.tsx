'use client';

import { Empty, List } from 'antd';
import { FamilyMembersListProps } from '../props';
import FamilyMemberCard from './FamilyMemberCard';

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({
  familyMembers,
  onEdit,
  onDelete
}) => {
  if (!familyMembers.length) {
    return (
      <Empty
        description="No family members have been added yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <List
      dataSource={familyMembers}
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 2,
        xl: 2,
        xxl: 3,
      }}
      renderItem={(member) => (
        <List.Item key={member.id}>
          <FamilyMemberCard
            member={member}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </List.Item>
      )}
    />
  );
};

export default FamilyMembersList;
