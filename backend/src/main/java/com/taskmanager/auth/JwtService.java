package com.taskmanager.auth;

import com.taskmanager.domain.Role;
import com.taskmanager.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    public String generateToken(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + expirationMs);

        return Jwts.builder()
            .subject(principal.getEmail())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .claims(Map.of(
                        "userId", principal.getId(),
                "username", principal.getDisplayUsername(),
                        "role", principal.getRole().name()))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserPrincipal principal) {
        return extractUsername(token).equals(principal.getEmail()) && !isTokenExpired(token);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Number.class).longValue());
    }

    public Role extractRole(String token) {
        return Role.valueOf(extractClaim(token, claims -> claims.get("role", String.class)));
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        if (secret.length() >= 32) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        } else {
            keyBytes = Decoders.BASE64.decode(secret);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
