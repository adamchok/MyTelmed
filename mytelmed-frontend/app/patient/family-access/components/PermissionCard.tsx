'use client';

import { Card, Switch } from 'antd';
import { PermissionCardProps } from '../props';

const PermissionCard: React.FC<PermissionCardProps> = ({
  title,
  description,
  permissionKey,
  value,
  onChange
}) => {
  return (
    <Card className="w-full shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Switch
          checked={value}
          onChange={(checked) => onChange(permissionKey, checked)}
          aria-label={`Toggle ${title} permission`}
        />
      </div>
    </Card>
  );
};

export default PermissionCard; 