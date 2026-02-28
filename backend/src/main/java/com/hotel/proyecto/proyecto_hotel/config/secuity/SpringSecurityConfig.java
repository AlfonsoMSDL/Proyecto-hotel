package com.hotel.proyecto.proyecto_hotel.config.secuity;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SpringSecurityConfig {

    @Bean
    PasswordEncoder getPasswordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity httpSecurity){
        return httpSecurity.authorizeHttpRequests(authz -> 
            authz.requestMatchers("/usuarios/**").permitAll().
            anyRequest().authenticated()).
            csrf(config -> config.disable()).
            sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).
            build();
        
    } 
}
