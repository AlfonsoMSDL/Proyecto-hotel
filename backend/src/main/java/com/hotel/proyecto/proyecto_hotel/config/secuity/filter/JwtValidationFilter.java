package com.hotel.proyecto.proyecto_hotel.config.secuity.filter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JwtValidationFilter extends OncePerRequestFilter{


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {

        String header_token = request.getHeader(TokenJwtConfig.HEADER_AUTHORIZATION);

        if(header_token == null || !header_token.startsWith(TokenJwtConfig.PREFIX_BEARER)){ //El header no fue enviado en la peticion o esta mal escrito
            
            doFilter(request, response, chain);
            return;
        }

        String token = header_token.replace(TokenJwtConfig.PREFIX_BEARER,"");

        try{
            Claims claims = Jwts.parser().
                                    verifyWith(TokenJwtConfig.SECRET_KEY).
                                    build().
                                    parseSignedClaims(token).
                                    getPayload();
            

            String correo = claims.getSubject();

            List<String> authorityString = (List<String>) claims.get("authority");

            List<GrantedAuthority> authority = authorityString
                                                .stream()
                                                .map(SimpleGrantedAuthority::new)
                                                .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(correo,null, authority);

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            chain.doFilter(request, response);
        }catch(JwtException ex){
            Map<String, String> errorBody = new HashMap<>();
            errorBody.put("error", "Token inválido o expirado");
            errorBody.put("mensaje", ex.getMessage());

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(TokenJwtConfig.CONTENT_TYPE);
            response.getWriter().write(new ObjectMapper().writeValueAsString(errorBody));
        }
       
        
    }

    


}
