package com.hotel.proyecto.proyecto_hotel.config.secuity.filter;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.proyecto.proyecto_hotel.dto.request.UsuarioLogin;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;



public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private AuthenticationManager authenticationManager;


    public JwtAuthenticationFilter(AuthenticationManager authenticationManager) {
        
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {

        UsuarioLogin usuarioLogin = null;
        String clave = null;
        String correo = null;

        try {
            usuarioLogin = new ObjectMapper().readValue(request.getInputStream(), UsuarioLogin.class);

            correo = usuarioLogin.correo();
            clave = usuarioLogin.clave();
        } catch (StreamReadException e) {
            e.printStackTrace();
        } catch (DatabindException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(correo,clave);

        return authenticationManager.authenticate(authenticationToken);

        
    
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {

        User user = (User) authResult.getPrincipal();
        String correo = user.getUsername();
        

        //Como un usuario solo puede tener un rol, va a obtener un solo rol en las authorities
        List<String> rol = user.getAuthorities()
                            .stream()
                            .map(GrantedAuthority::getAuthority)
                            .toList();


        String token = Jwts.builder()
        .subject(correo)
        .claim("authority",rol)
        .signWith(TokenJwtConfig.SECRET_KEY)
        .expiration(new Date(System.currentTimeMillis() + 300000))
        .compact();
    
        response.setHeader(TokenJwtConfig.HEADER_AUTHORIZATION, TokenJwtConfig.PREFIX_BEARER+token);

        Map<String,String> body = new HashMap<>();
        body.put("token", token);
        body.put("correo", correo);
        body.put("mensaje",String.format("Bienvenido %s",correo));


        response.setContentType(TokenJwtConfig.CONTENT_TYPE);

        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
        response.setStatus(200);
        

    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,AuthenticationException failed) throws IOException, ServletException {

        Map<String,String> body = new HashMap<>();
        body.put("error", "Las credenciales son incorrectas");


        response.setContentType(TokenJwtConfig.CONTENT_TYPE);
        response.setStatus(401);
        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
    }

    

    

    



    

}
