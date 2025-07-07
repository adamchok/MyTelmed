package com.mytelmed.common.utils;

import java.time.Instant;
import java.time.LocalDate;
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
     * Format a LocalDate to a EU-formatted date string (dd/MM/yyyy)
     *
     * @param date the LocalDate to format
     * @return the formatted date string, or null if input is null
     */
    public static String localDateToUsString(LocalDate date) {
        if (date == null) {
            return null;
        }
        return EU_DATE_FORMATTER.format(date);
    }
}