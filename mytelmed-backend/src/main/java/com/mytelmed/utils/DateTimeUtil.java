package com.mytelmed.utils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;


public class DateTimeUtil {
    private static final ZoneId zoneId = ZoneId.of( "Asia/Kuala_Lumpur");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static Instant toInstant(LocalDateTime dateTime) {
        return dateTime.atZone(zoneId).toInstant();
    }

    public static LocalDate toLocalDate(String localDate) {
        return LocalDate.parse(localDate, formatter);
    }
}
