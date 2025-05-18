export interface AvailabilityGridProps {
  availability: { date: string, count: number, booking: string }[];
  doctorId?: number;
  doctorName?: string;
}
