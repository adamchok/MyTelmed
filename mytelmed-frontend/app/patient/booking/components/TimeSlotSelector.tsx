'use client';

import { Radio, Typography, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TimeSlotSelectorProps } from '../props';

const { Text } = Typography;

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableTimes,
  selectedTime,
  onTimeSelect
}) => {
  const handleTimeSelect = (time: string) => {
    onTimeSelect(time);
  };

  const getMorningTimes = () => availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0], 10);
    return hour < 12;
  });

  const getAfternoonTimes = () => availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0], 10);
    return hour >= 12 && hour < 17;
  });

  const getEveningTimes = () => availableTimes.filter(time => {
    const hour = parseInt(time.split(':')[0], 10);
    return hour >= 17;
  });

  const morningTimes = getMorningTimes();
  const afternoonTimes = getAfternoonTimes();
  const eveningTimes = getEveningTimes();

  return (
    <div className="mt-3">
      <Radio.Group
        onChange={(e) => handleTimeSelect(e.target.value)}
        value={selectedTime}
        className="w-full"
      >
        {morningTimes.length > 0 && (
          <div className="mb-3">
            <Text strong className="block mb-2">Morning</Text>
            <div className="flex flex-wrap gap-2">
              {morningTimes.map((time) => (
                <Radio.Button
                  key={time}
                  value={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                >
                  <Space>
                    <ClockCircleOutlined />
                    {time}
                  </Space>
                </Radio.Button>
              ))}
            </div>
          </div>
        )}

        {afternoonTimes.length > 0 && (
          <div className="mb-3">
            <Text strong className="block mb-2">Afternoon</Text>
            <div className="flex flex-wrap gap-2">
              {afternoonTimes.map((time) => (
                <Radio.Button
                  key={time}
                  value={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                >
                  <Space>
                    <ClockCircleOutlined />
                    {time}
                  </Space>
                </Radio.Button>
              ))}
            </div>
          </div>
        )}

        {eveningTimes.length > 0 && (
          <div className="mb-3">
            <Text strong className="block mb-2">Evening</Text>
            <div className="flex flex-wrap gap-2">
              {eveningTimes.map((time) => (
                <Radio.Button
                  key={time}
                  value={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                >
                  <Space>
                    <ClockCircleOutlined />
                    {time}
                  </Space>
                </Radio.Button>
              ))}
            </div>
          </div>
        )}
      </Radio.Group>

      <style jsx global>{`
        .time-slot.selected {
          border-color: #1890ff;
          color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default TimeSlotSelector; 