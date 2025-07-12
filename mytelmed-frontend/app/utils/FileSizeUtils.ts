/**
 * Utility functions for formatting file sizes
 */

/**
 * Maximum file upload size in bytes (10MB)
 */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Maximum file upload size in human-readable format
 */
export const MAX_UPLOAD_SIZE_DISPLAY = "10 MB";

/**
 * Format file size from bytes to human-readable format
 * @param bytes - File size in bytes (can be string or number)
 * @returns Formatted file size string (e.g., "1.2 MB", "345 KB", "2.5 GB")
 */
export const formatFileSize = (bytes: string | number): string => {
    // Convert to number if it's a string
    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;

    // Handle invalid input
    if (isNaN(numBytes) || numBytes < 0) {
        return "0 B";
    }

    // If less than 1 byte
    if (numBytes === 0) {
        return "0 B";
    }

    // Define size units
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    const k = 1024;

    // Calculate the appropriate unit
    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    // Ensure we don't exceed our units array
    const unitIndex = Math.min(i, units.length - 1);

    // Calculate the size in the appropriate unit
    const size = numBytes / Math.pow(k, unitIndex);

    // Format the number
    // For bytes, show as integer
    if (unitIndex === 0) {
        return `${numBytes} ${units[unitIndex]}`;
    }

    // For other units, show 1 decimal place if needed
    const formattedSize = size < 10 ? size.toFixed(1) : size.toFixed(0);

    // Remove unnecessary .0
    const cleanSize = formattedSize.replace(/\.0$/, "");

    return `${cleanSize} ${units[unitIndex]}`;
};

/**
 * Format file size with additional context
 * @param bytes - File size in bytes
 * @param showBytes - Whether to show the byte count in parentheses
 * @returns Formatted file size string with optional byte count
 */
export const formatFileSizeWithContext = (bytes: string | number, showBytes: boolean = false): string => {
    const formatted = formatFileSize(bytes);

    if (!showBytes) {
        return formatted;
    }

    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;

    if (isNaN(numBytes) || numBytes < 1024) {
        return formatted; // Don't show bytes for small files
    }

    return `${formatted} (${numBytes.toLocaleString()} bytes)`;
};

/**
 * Get file size category for styling purposes
 * @param bytes - File size in bytes
 * @returns Category string for styling
 */
export const getFileSizeCategory = (bytes: string | number): "small" | "medium" | "large" | "huge" => {
    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;

    if (isNaN(numBytes) || numBytes < 0) {
        return "small";
    }

    // Define size categories
    const MB = 1024 * 1024;
    const GB = MB * 1024;

    if (numBytes < MB) {
        return "small"; // Less than 1MB
    } else if (numBytes < 10 * MB) {
        return "medium"; // 1MB - 10MB
    } else if (numBytes < GB) {
        return "large"; // 10MB - 1GB
    } else {
        return "huge"; // More than 1GB
    }
};
