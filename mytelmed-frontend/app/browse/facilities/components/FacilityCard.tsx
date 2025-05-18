'use client'

import { Button, Card, Image } from 'antd';
import Link from 'next/link';
import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import { calculateDistanceFromAddress } from '@/app/utils/DistanceUtils';
import { FacilityCardProps } from './props';
import Title from 'antd/es/typography/Title';

const FacilityCard = ({ facility, setSelectedFacility, selectedFacility, userLocation }: FacilityCardProps) => {
  return (
    <Card
      key={facility.id}
      onClick={() => setSelectedFacility(facility)}
      className={`rounded-lg mb-2 bg-white hover:shadow-lg transition w-full text-left cursor-pointer ${selectedFacility?.id === facility.id ? "ring-2 ring-sky-500" : ""}`}
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
        <Image
          src={facility.imageUrl}
          alt={facility.name}
          width={150}
          height={150}
          className="flex flex-shrink-0 object-cover rounded-lg border bg-transparent"
          preview={false}
        />
        <div className="flex-1 w-full">
          <Title level={3} className="text-blue-900 text-bold mb-1 mt-0">{facility.name}</Title>
          <div className="flex items-center text-gray-600 mb-2">
            <EnvironmentOutlined className="mr-2" />
            {facility.address}
          </div>
          <div className="text-sm text-gray-700 mb-2">
            <PhoneOutlined className="mr-2" />
            <span className="text-gray-600">{facility.telephone}</span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-semibold">Type:</span> {facility.type}
          </div>
          {/* {userLocation && (
            <div className="text-xs text-gray-500 mb-1">
              {(async () => {
                const distance = await calculateDistanceFromAddress(
                  userLocation.latitude,
                  userLocation.longitude,
                  facility.address
                );
                if (distance) {
                  return `You are ${distance.toFixed(1)} km away`;
                }
                return "";
              })()}
            </div>
          )} */}
        </div>
        <div className="">
          <Link
            href={`/browse/doctors?facility=${encodeURIComponent(facility.name)}`}
            onClick={e => e.stopPropagation()}
          >
            <Button
              type="primary"
              size="large"
              className="font-bold"
            >
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>
    </Card >
  )
}

export default FacilityCard;
