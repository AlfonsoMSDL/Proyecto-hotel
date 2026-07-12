package com.hotel.proyecto.proyecto_hotel.config.secuity.filter;

import javax.crypto.SecretKey;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

public class TokenJwtConfig {
    public static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(Decoders.BASE64.decode(System.getenv("SECRET_KEY_BACKEND")));
    public static final String HEADER_AUTHORIZATION="Authorization";
    public static final String CONTENT_TYPE="application/json";
    public static final String PREFIX_BEARER="Bearer ";


}
