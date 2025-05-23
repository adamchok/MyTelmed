package com.mytelmed.common.utils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;


/**
 * A utility class that provides various methods for working with dates and times,
 * including conversions, formatting, parsing, and utility operations.
 */
public class DateTimeUtil {
    private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();
    private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter.ISO_DATE;
    private static final DateTimeFormatter US_DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter EU_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter YEAR_MONTH_DAY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    /**
     * Private constructor to prevent instantiation
     */
    private DateTimeUtil() {
        throw new UnsupportedOperationException("Utility class should not be instantiated");
    }
    
    /**
     * Convert an Instant to LocalDate using the system default time zone
     *
     * @param instant the Instant to convert
     * @return the corresponding LocalDate, or null if input is null
     */
    public static LocalDate instantToLocalDate(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(DEFAULT_ZONE).toLocalDate();
    }
    
    /**
     * Convert an Instant to LocalDate using a specified time zone
     *
     * @param instant the Instant to convert
     * @param zoneId the time zone to use for conversion
     * @return the corresponding LocalDate, or null if input is null
     */
    public static LocalDate instantToLocalDate(Instant instant, ZoneId zoneId) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(zoneId != null ? zoneId : DEFAULT_ZONE).toLocalDate();
    }
    
    /**
     * Convert a String to LocalDate using multiple common formats
     * Attempts parsing with ISO, yyyy-MM-dd, MM/dd/yyyy, and dd/MM/yyyy formats
     *
     * @param dateString the date string to parse
     * @return an Optional containing the parsed LocalDate, or empty if parsing failed
     */
    public static Optional<LocalDate> stringToLocalDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return Optional.empty();
        }
        
        String trimmedDate = dateString.trim();

        DateTimeFormatter[] formatters = {
            ISO_DATE_FORMATTER,
            YEAR_MONTH_DAY_FORMATTER,
            US_DATE_FORMATTER,
            EU_DATE_FORMATTER
        };
        
        for (DateTimeFormatter formatter : formatters) {
            try {
                return Optional.of(LocalDate.parse(trimmedDate, formatter));
            } catch (DateTimeParseException ignored) {
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * Convert a String to LocalDate using a specific format
     *
     * @param dateString the date string to parse
     * @param pattern the date format pattern
     * @return an Optional containing the parsed LocalDate, or empty if parsing failed
     */
    public static Optional<LocalDate> stringToLocalDate(String dateString, String pattern) {
        if (dateString == null || dateString.trim().isEmpty() || pattern == null) {
            return Optional.empty();
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return Optional.of(LocalDate.parse(dateString.trim(), formatter));
        } catch (DateTimeParseException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Convert a String to LocalDate with a fallback default value
     *
     * @param dateString the date string to parse
     * @param defaultValue the default value to return if parsing fails
     * @return the parsed LocalDate or the default value
     */
    public static LocalDate stringToLocalDateOrDefault(String dateString, LocalDate defaultValue) {
        return stringToLocalDate(dateString).orElse(defaultValue);
    }
    
    /**
     * Convert LocalDate to Instant at the start of the day
     *
     * @param localDate the LocalDate to convert
     * @return the corresponding Instant at the start of the day, or null if input is null
     */
    public static Instant localDateToInstant(LocalDate localDate) {
        if (localDate == null) {
            return null;
        }
        return localDate.atStartOfDay(DEFAULT_ZONE).toInstant();
    }
    
    /**
     * Convert LocalDate to Instant at the start of the day in a specific time zone
     *
     * @param localDate the LocalDate to convert
     * @param zoneId the time zone to use for conversion
     * @return the corresponding Instant, or null if input is null
     */
    public static Instant localDateToInstant(LocalDate localDate, ZoneId zoneId) {
        if (localDate == null) {
            return null;
        }
        return localDate.atStartOfDay(zoneId != null ? zoneId : DEFAULT_ZONE).toInstant();
    }
    
    /**
     * Check if an Instant is today in the system default time zone
     *
     * @param instant the Instant to check
     * @return true if the Instant corresponds to today's date
     */
    public static boolean isToday(Instant instant) {
        if (instant == null) {
            return false;
        }
        LocalDate date = instantToLocalDate(instant);
        return date.equals(LocalDate.now());
    }
    
    /**
     * Check if a LocalDate is today
     *
     * @param date the LocalDate to check
     * @return true if the date is today
     */
    public static boolean isToday(LocalDate date) {
        if (date == null) {
            return false;
        }
        return date.equals(LocalDate.now());
    }
    
    /**
     * Format a LocalDate as a string using the ISO date format (yyyy-MM-dd)
     *
     * @param localDate the LocalDate to format
     * @return the formatted date string, or null if input is null
     */
    public static String formatLocalDate(LocalDate localDate) {
        if (localDate == null) {
            return null;
        }
        return localDate.format(ISO_DATE_FORMATTER);
    }
    
    /**
     * Format a LocalDate as a string using a specific pattern
     *
     * @param localDate the LocalDate to format
     * @param pattern the date format pattern
     * @return the formatted date string, or null if input is null
     */
    public static String formatLocalDate(LocalDate localDate, String pattern) {
        if (localDate == null || pattern == null) {
            return null;
        }
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return localDate.format(formatter);
        } catch (IllegalArgumentException e) {
            return localDate.format(ISO_DATE_FORMATTER);
        }
    }
    
    /**
     * Parse a LocalDateTime from a string and pattern
     *
     * @param dateTimeString the date-time string to parse
     * @param pattern the date-time format pattern
     * @return an Optional containing the parsed LocalDateTime, or empty if parsing failed
     */
    public static Optional<LocalDateTime> stringToLocalDateTime(String dateTimeString, String pattern) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty() || pattern == null) {
            return Optional.empty();
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return Optional.of(LocalDateTime.parse(dateTimeString.trim(), formatter));
        } catch (DateTimeParseException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Get the current date as LocalDate
     *
     * @return the current date
     */
    public static LocalDate getCurrentDate() {
        return LocalDate.now();
    }
}