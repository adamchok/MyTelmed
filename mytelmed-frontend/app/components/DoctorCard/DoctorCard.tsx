'use client';

import { Card, Image } from "antd";
import { useMemo, memo } from "react";
import { DoctorCardProps } from "./props";
import { MedicineBoxOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import AvailabilityGrid from "@/app/components/AvailabilityGrid/AvailabilityGrid";
import { calculateDistanceFromAddress } from "@/app/utils/DistanceUtils";

const DoctorCard = memo(({
  doctor,
  userLocation
}: DoctorCardProps) => {
  const distance = useMemo(async () => {
    if (!userLocation) return null;
    const distance = await calculateDistanceFromAddress(
      userLocation.latitude,
      userLocation.longitude,
      doctor.facility.address
    );
    return distance?.toFixed(1);
  }, [doctor.facility.address, userLocation]);

  return (
    <Card
      key={doctor.id}
      className={'transition w-full shadow-sm'}
      bodyStyle={{ padding: 0 }}
      hoverable={false}
      style={{ borderRadius: '0.5rem', marginBottom: 5 }}
    >
      <div className="flex flex-col md:flex-row p-6">
        <div className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 flex-shrink-0 mb-4 md:mb-0 md:pr-6">
          <div className="w-full">
            <div className="flex gap-4 items-center mb-4">
              <Image
                src={doctor.image}
                alt={doctor.name}
                width={80}
                height={80}
                className="object-cover rounded-full border"
                style={{ background: "#fff" }}
              />
              <div className="flex flex-col gap-0">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                  {doctor.name}
                </h2>
                <div className="flex items-center text-blue-700 dark:text-blue-200 mb-1">
                  <MedicineBoxOutlined className="mr-2" />
                  {doctor.specialty}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
              <EnvironmentOutlined className="mr-2" />
              {doctor.facility.name} ({doctor.facility.city}, {doctor.facility.state})
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
              <PhoneOutlined className="mr-2" />
              <span className="text-gray-600">{doctor.phone}</span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
              <MailOutlined className="mr-2" />
              <span className="text-gray-600">{doctor.email}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {doctor.description}
            </div>
            {distance && (
              <div className="text-xs text-gray-500 mb-1">
                You are {distance} km away
              </div>
            )}
          </div>
        </div>
        {doctor.availability &&
          <AvailabilityGrid
            availability={doctor.availability}
            doctorId={doctor.id}
            doctorName={doctor.name}
          />
        }
      </div>
    </Card>
  );
});

DoctorCard.displayName = 'DoctorCard';

export default DoctorCard;
