import { TimeSlotDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";

/**
 * Date and time utilities for time slot management
 */
export class TimeSlotUtils {
    /**
     * Get minimum allowed date (tomorrow)
     */
    static getMinimumDate(): Date {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }

    /**
     * Get maximum allowed date (3 weeks from today)
     */
    static getMaximumDate(): Date {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 21); // 3 weeks
        maxDate.setHours(23, 59, 59, 999);
        return maxDate;
    }

    /**
     * Check if a date is within the allowed range for creating time slots
     */
    static isDateInAllowedRange(date: Date): boolean {
        const minDate = this.getMinimumDate();
        const maxDate = this.getMaximumDate();
        return date >= minDate && date <= maxDate;
    }

    /**
     * Format date for API calls (ISO string)
     */
    static formatDateForAPI(date: Date): string {
        return date.toISOString();
    }

    /**
     * Format date for display (human readable)
     */
    static formatDateForDisplay(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-MY", {
            year: "numeric",
            month: "short",
            day: "numeric",
            weekday: "short",
        });
    }

    /**
     * Format time for display (human readable)
     */
    static formatTimeForDisplay(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-MY", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    /**
     * Get time slot duration in human readable format
     */
    static formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }
        return `${hours}hr ${remainingMinutes}min`;
    }

    /**
     * Create a new time slot object with default values
     */
    static createDefaultTimeSlot(): Partial<TimeSlotDto> {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(9, 0, 0, 0); // Default to 9 AM tomorrow

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30); // Default 30 minute slot

        return {
            startTime: this.formatDateForAPI(startTime),
            endTime: this.formatDateForAPI(endTime),
            durationMinutes: 30,
            consultationMode: ConsultationMode.VIRTUAL,
            isAvailable: true,
            isBooked: false,
        };
    }

    /**
     * Validate time slot data
     */
    static validateTimeSlot(timeSlot: Partial<TimeSlotDto>): string[] {
        const errors: string[] = [];

        if (!timeSlot.startTime) {
            errors.push("Start time is required");
        }
        if (!timeSlot.endTime) {
            errors.push("End time is required");
        }
        if (!timeSlot.durationMinutes || timeSlot.durationMinutes < 15 || timeSlot.durationMinutes > 180) {
            errors.push("Duration must be between 15 and 180 minutes");
        }
        if (!timeSlot.consultationMode) {
            errors.push("Consultation mode is required");
        }

        if (timeSlot.startTime && timeSlot.endTime) {
            const startDate = new Date(timeSlot.startTime);
            const endDate = new Date(timeSlot.endTime);

            if (!this.isDateInAllowedRange(startDate)) {
                errors.push("Start time must be between tomorrow and 3 weeks from today");
            }

            if (endDate <= startDate) {
                errors.push("End time must be after start time");
            }

            const actualDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
            if (timeSlot.durationMinutes && Math.abs(actualDuration - timeSlot.durationMinutes) > 1) {
                errors.push("Duration must match the time difference between start and end time");
            }
        }

        return errors;
    }

    /**
     * Check if a time slot can be edited
     */
    static canEditTimeSlot(timeSlot: TimeSlotDto): boolean {
        return !timeSlot.isBooked;
    }

    /**
     * Get time slot status text
     */
    static getTimeSlotStatus(timeSlot: TimeSlotDto): string {
        if (timeSlot.isBooked) return "Booked";
        if (!timeSlot.isAvailable) return "Disabled";
        return "Available";
    }

    /**
     * Get time slot status color
     */
    static getTimeSlotStatusColor(timeSlot: TimeSlotDto): string {
        if (timeSlot.isBooked) return "#ff4d4f"; // Red
        if (!timeSlot.isAvailable) return "#faad14"; // Orange
        return "#52c41a"; // Green
    }

    /**
     * Generate time options for dropdowns (15-minute intervals)
     */
    static generateTimeOptions(): Array<{ label: string; value: string }> {
        const options: Array<{ label: string; value: string }> = [];

        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-MY", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
                options.push({
                    label: displayTime,
                    value: timeString,
                });
            }
        }

        return options;
    }

    /**
     * Generate duration options for dropdowns
     */
    static generateDurationOptions(): Array<{ label: string; value: number }> {
        const durations = [15, 30, 45, 60, 90, 120, 150, 180];
        return durations.map((duration) => ({
            label: this.formatDuration(duration),
            value: duration,
        }));
    }

    /**
     * Group time slots by date
     */
    static groupTimeSlotsByDate(timeSlots: TimeSlotDto[]): Record<string, TimeSlotDto[]> {
        return timeSlots.reduce((groups, slot) => {
            const date = new Date(slot.startTime).toISOString().split("T")[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(slot);
            return groups;
        }, {} as Record<string, TimeSlotDto[]>);
    }

    /**
     * Sort time slots by start time
     */
    static sortTimeSlots(timeSlots: TimeSlotDto[]): TimeSlotDto[] {
        return [...timeSlots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
}
