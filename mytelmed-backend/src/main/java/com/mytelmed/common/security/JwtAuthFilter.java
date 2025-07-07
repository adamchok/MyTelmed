package com.mytelmed.common.security;

import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.JwtService;
import com.mytelmed.core.auth.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;


@Slf4j
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtService jwtService;
    private final UserService userService;

    public JwtAuthFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    private void authenticateWithToken(HttpServletRequest request, String token) {
        final String username = jwtService.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.debug("JWT token processing for user: {}", username);

            Account userDetails = userService.loadUserByUsername(username);

            if (jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authentication = createAuthenticationToken(userDetails, request);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                storeUserIdInSession(request, userDetails);
                log.info("User authenticated successfully: {} with roles: {}", username, userDetails.getAuthorities());
            } else {
                log.warn("Token validation failed for user: {}", username);
            }
        }
    }

    private UsernamePasswordAuthenticationToken createAuthenticationToken(Account userDetails, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities());

        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        return authToken;
    }

    private void storeUserIdInSession(HttpServletRequest request, Account userDetails) {
        HttpSession session = request.getSession();
        session.setAttribute("userId", userDetails.getId().toString());
        log.debug("User ID stored in session: {}", userDetails.getId());
    }

    private void sendAuthError(HttpServletResponse response, String message) throws IOException {
        response.sendError(HttpStatus.UNAUTHORIZED.value(), message);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws IOException {
        final String requestURI = request.getRequestURI();
        final String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        try {
            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                log.debug("No JWT token found in request headers for URI: {}", requestURI);
                filterChain.doFilter(request, response);
                return;
            }

            final String token = authHeader.substring(BEARER_PREFIX.length());
            authenticateWithToken(request, token);

            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
            sendAuthError(response, "JWT token has expired. Please login again.");
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            sendAuthError(response, "Invalid JWT signature. Authentication failed.");
        } catch (JwtException e) {
            log.error("JWT token error: {}", e.getMessage());
            sendAuthError(response, "JWT token is invalid. Please login again.");
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage(), e);
            sendAuthError(response, "Authentication failed. Please try again later.");
        }
    }
}