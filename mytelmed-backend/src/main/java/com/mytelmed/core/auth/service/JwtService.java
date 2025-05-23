package com.mytelmed.core.auth.service;

import com.mytelmed.core.auth.entity.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;


@Slf4j
@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long accessTokenExpirationMs;
    private final UserService userService;

    public JwtService(
            @Value("${application.security.jwt.secret-key}") String secretKey,
            @Value("${application.security.jwt.access-token-expiration}") long accessTokenExpirationMins,
            UserService userService
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
        this.accessTokenExpirationMs = accessTokenExpirationMins * 60 * 1000;
        this.userService = userService;
        log.info("JWT Service initialized with token expiration of {} minutes", accessTokenExpirationMins);
    }

    public String generateAccessToken(String username) {
        log.debug("Generating access token for user: {}", username);
        return Jwts.builder()
                .claims(new HashMap<>())
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            log.error("Failed to extract username from token: {}", e.getMessage());
            throw new JwtException("Invalid token", e);
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            throw e;
        }
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        
        if (!isValid) {
            log.debug("Token validation failed for user: {}", userDetails.getUsername());
        }
        
        return isValid;
    }

    public boolean validateAccessToken(String token) {
        try {
            String username = extractUsername(token);
            boolean isValid = username != null && !username.isEmpty() && !isTokenExpired(token);
            
            if (!isValid) {
                log.debug("Access token validation failed, token is expired or invalid");
            }
            
            return isValid;
        } catch (Exception e) {
            log.warn("Access token validation error: {}", e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Account loadUserByToken(String token) {
        String username = extractUsername(token);
        log.debug("Loading user details for token with username: {}", username);
        return userService.loadUserByUsername(username);
    }

    public Authentication getAuthentication(String token) {
        Account userDetails = loadUserByToken(token);
        log.debug("Creating authentication for user: {} with roles: {}", 
                  userDetails.getUsername(), 
                  userDetails.getAuthorities());
        return new UsernamePasswordAuthenticationToken(
                userDetails, 
                null, 
                userDetails.getAuthorities()
        );
    }
}