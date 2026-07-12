package com.hotel.proyecto.proyecto_hotel.config.secuity.filter;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Jwts;

public class TokenJwtConfig {
    public static final SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
    public static final String HEADER_AUTHORIZATION="Authorization";
    public static final String CONTENT_TYPE="application/json";
    public static final String PREFIX_BEARER="Bearer ";


}
