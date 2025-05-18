'use client';

import { GoogleOutlined } from "@ant-design/icons";
import { MapFrameProps } from "./props";
import { Image } from "antd";
import Link from "next/link";

const MapFrame = ({ selectedFacility }: MapFrameProps) => {
  return (
    <>
      {selectedFacility && (
        <>
          <iframe
            title={`Map of ${selectedFacility.name}`}
            width="100%"
            height="500"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(selectedFacility.address)}&z=16&output=embed`}
            className="rounded-xl border-none"
          />
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFacility.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-full shadow p-2 hover:bg-blue-100 transition"
              title="Open in Google Maps"
            >
              <GoogleOutlined className="text-[24px] text-blue-600" />
            </Link>
            <Link
              href={`https://waze.com/ul?q=${encodeURIComponent(selectedFacility.address)}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-full shadow p-2 hover:bg-blue-100 transition"
              title="Open in Waze"
            >
              <Image src="/icons/waze-icon.png" alt="Waze" width={24} height={24} preview={false} />
            </Link>
          </div>
        </>
      )}
    </>
  );
};

export default MapFrame;
