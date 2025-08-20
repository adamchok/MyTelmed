# Stage 1: Build stage
FROM gradle:8.14.2-jdk21-alpine AS build

# Set working directory
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradlew.bat .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x gradlew

# Copy source code
COPY src/ src/

# Build the application
RUN ./gradlew build --no-daemon -x test


# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install curl for health checks, tzdata for timezone support, and X-Ray daemon
RUN apk add --no-cache curl tzdata unzip

# Set timezone to Asia/Kuala_Lumpur (as configured in the application)
ENV TZ=Asia/Kuala_Lumpur
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create non-root user for security
RUN addgroup -g 1001 -S mytelmed && \
    adduser -u 1001 -S mytelmed -G mytelmed

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/build/libs/app.jar app.jar

# Change ownership to non-root user
RUN chown -R mytelmed:mytelmed /app

# Switch to non-root user
USER mytelmed

# Expose port 8080 for the application
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app/app.jar"]
