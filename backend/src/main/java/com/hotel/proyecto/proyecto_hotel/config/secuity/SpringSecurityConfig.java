package com.hotel.proyecto.proyecto_hotel.config.secuity;
import java.util.Arrays;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.hotel.proyecto.proyecto_hotel.config.secuity.filter.JwtAuthenticationFilter;
import com.hotel.proyecto.proyecto_hotel.config.secuity.filter.JwtValidationFilter;
import com.hotel.proyecto.proyecto_hotel.service.UsuarioService;

import lombok.AllArgsConstructor;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@AllArgsConstructor
public class SpringSecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;


    @Bean
    AuthenticationManager getAuthenticationManager(){
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder getPasswordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity httpSecurity, AuthenticationManager authenticationManager, UsuarioService usuarioService) throws Exception {

        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(
                        authenticationManager, usuarioService);


        return httpSecurity
                .authorizeHttpRequests(authz ->
                    authz
                        .requestMatchers(HttpMethod.POST,"/usuarios").permitAll()
                        .requestMatchers("/swagger-ui/**","/v3/api-docs/**","/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET,"/habitaciones").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilter(jwtAuthenticationFilter)
                .addFilterBefore(
                        new JwtValidationFilter(),
                        UsernamePasswordAuthenticationFilter.class
                )
                .csrf(config -> config.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(management ->
                        management.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();
        //Permitir las peticiones de todos los clientes
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        //Permitir las peticiones para todos los tipos de metodos
        config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE"));
        //Permitir las peticiones para algunas cabeceras
        config.setAllowedHeaders(Arrays.asList("Authorization","Content-Type"));
        config.setAllowCredentials(true);

        //Ahora le digo que la config anterior la aplique a todos los controladores
        //de la aplicacion
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;

    }

    @Bean
    FilterRegistrationBean<CorsFilter> corsFilter(){
        FilterRegistrationBean<CorsFilter> corsBean = 
        new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource()));
        corsBean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return corsBean;
    }
}
