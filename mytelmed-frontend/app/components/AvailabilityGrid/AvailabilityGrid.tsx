import { CloseCircleOutlined, VideoCameraOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Button, Tooltip } from 'antd';
import { AvailabilityGridProps } from './props';
import './index.css';


const getCellColor = (count: number, booking: string) => {
  if (booking === 'none' || count === 0) {
    return "bg-gray-200 text-gray-400 border border-gray-300";
  }

  if (count >= 8) {
    return "bg-green-500 text-white border border-green-600 hover:brightness-95 cursor-pointer";
  } else if (count >= 6) {
    return "bg-green-400 text-white border border-green-500 hover:brightness-95 cursor-pointer";
  } else if (count >= 4) {
    return "bg-green-300 text-green-900 border border-green-400 hover:brightness-95 cursor-pointer";
  } else if (count >= 3) {
    return "bg-yellow-300 text-yellow-900 border border-yellow-400 hover:brightness-95 cursor-pointer";
  } else if (count === 2) {
    return "bg-orange-300 text-orange-900 border border-orange-400 hover:brightness-95 cursor-pointer";
  } else {
    return "bg-red-300 text-red-900 border border-red-400 hover:brightness-95 cursor-pointer";
  }
};

const getBookingIcons = (booking: string) => {
  if (booking === 'none') return <CloseCircleOutlined className="text-lg text-gray-800" />;
  if (booking === 'video') return <VideoCameraOutlined className="text-lg text-gray-800" />;
  if (booking === 'physical') return <EnvironmentOutlined className="text-lg text-gray-800" />;
  if (booking === 'both') return (
    <span className="flex gap-1">
      <VideoCameraOutlined className="text-gray-800" />
      <EnvironmentOutlined className="text-gray-800" />
    </span>
  );
  return null;
};

const getBookingTypeText = (booking: string): string => {
  if (booking === 'both') return 'Video & In-person';
  if (booking === 'video') return 'Video consultation';
  if (booking === 'physical') return 'In-person visit';
  return '';
};

const AvailabilityGrid = ({ availability, doctorId, doctorName }: AvailabilityGridProps) => {
  const router = useRouter();
  const padded = [...availability];
  while (padded.length < 14) padded.push({ date: '', count: 0, booking: 'none' });

  const week1 = padded.slice(0, 7);
  const week2 = padded.slice(7, 14);

  const handleSlotClick = (slot: { date: string, count: number, booking: string }) => {
    if (slot.booking === 'none' || slot.count === 0) return;

    router.push(`/booking?doctorId=${doctorId}&date=${encodeURIComponent(slot.date)}&bookingType=${slot.booking}&doctorName=${encodeURIComponent(doctorName || '')}`);
  };

  const renderSlot = (slot: { date: string, count: number, booking: string }, idx: number) => {
    if (!slot.date) return <div key={idx}></div>;

    let availabilityText = '';
    if (slot.booking === 'none' || slot.count === 0) {
      availabilityText = 'No availability';
    } else if (slot.count >= 8) {
      availabilityText = 'High availability';
    } else if (slot.count >= 6) {
      availabilityText = 'Good availability';
    } else if (slot.count >= 4) {
      availabilityText = 'Moderate availability';
    } else if (slot.count >= 3) {
      availabilityText = 'Limited availability';
    } else if (slot.count === 2) {
      availabilityText = 'Very limited availability';
    } else {
      availabilityText = 'Almost booked';
    }

    const bookingTypeText = getBookingTypeText(slot.booking);

    const tooltipTitle = slot.booking === 'none' || slot.count === 0
      ? 'No availability'
      : `${slot.count} appointments available - ${availabilityText} (${bookingTypeText})`;

    return (
      <div key={idx} className="flex flex-col items-center">
        <div className="text-xs text-center mb-1">{slot.date}</div>
        <Tooltip title={tooltipTitle}>
          <Button
            className={`appointment-button ${getCellColor(slot.count, slot.booking)} transition-all`}
            onClick={() => handleSlotClick(slot)}
            tabIndex={slot.booking === 'none' || slot.count === 0 ? -1 : 0}
            aria-disabled={slot.booking === 'none' || slot.count === 0}
            aria-label={`${slot.date} - ${slot.count} appointments available`}
            disabled={slot.booking === 'none' || slot.count === 0}
          >
            {getBookingIcons(slot.booking)}
          </Button>
        </Tooltip>
        <div className="text-xs mt-1 text-center">
          {slot.count > 0 ? `${slot.count}` : "0"} appts
        </div>
      </div>
    );
  };

  const renderMobileSlot = (slot: { date: string, count: number, booking: string }, idx: number) => {
    if (!slot.date) return <div key={idx} className="flex-shrink-0 w-14"></div>;

    let availabilityText = '';
    if (slot.booking === 'none' || slot.count === 0) {
      availabilityText = 'No availability';
    } else if (slot.count >= 8) {
      availabilityText = 'High availability';
    } else if (slot.count >= 6) {
      availabilityText = 'Good availability';
    } else if (slot.count >= 4) {
      availabilityText = 'Moderate availability';
    } else if (slot.count >= 3) {
      availabilityText = 'Limited availability';
    } else if (slot.count === 2) {
      availabilityText = 'Very limited availability';
    } else {
      availabilityText = 'Almost booked';
    }

    const bookingTypeText = getBookingTypeText(slot.booking);

    const tooltipTitle = slot.booking === 'none' || slot.count === 0
      ? 'No availability'
      : `${slot.count} appointments available - ${availabilityText} (${bookingTypeText})`;

    return (
      <div key={idx} className="flex-shrink-0 flex flex-col items-center">
        <div className="text-xs text-center mb-1">{slot.date.split(' ')[0]}</div>
        <div className="text-xs text-center font-semibold mb-1">{slot.date.split(' ')[1]}</div>
        <Tooltip title={tooltipTitle}>
          <Button
            className={`appointment-button ${getCellColor(slot.count, slot.booking)} transition-all`}
            onClick={() => handleSlotClick(slot)}
            tabIndex={slot.booking === 'none' || slot.count === 0 ? -1 : 0}
            aria-disabled={slot.booking === 'none' || slot.count === 0}
            aria-label={`${slot.date} - ${slot.count} appointments available`}
            disabled={slot.booking === 'none' || slot.count === 0}
          >
            {getBookingIcons(slot.booking)}
          </Button>
        </Tooltip>
        <div className="text-xs mt-1 text-center">
          {slot.count > 0 ? `${slot.count}` : "0"} appts
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full ml-0 md:ml-6 mt-4 md:mt-0 md:border-l md:pl-6">
      <div className="text-sm font-medium text-gray-700 mb-3">Availability</div>

      <div className="md:hidden overflow-hidden">
        <div className="flex space-x-2 overflow-x-scroll pb-5 gap-3">
          {padded.map((slot, idx) => renderMobileSlot(slot, idx))}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-2 mb-5">
          {week1.map((slot, idx) => renderSlot(slot, idx))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {week2.map((slot, idx) => renderSlot(slot, idx))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityGrid;