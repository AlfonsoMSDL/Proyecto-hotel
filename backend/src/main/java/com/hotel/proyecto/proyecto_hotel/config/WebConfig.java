package com.hotel.proyecto.proyecto_hotel.config;

import java.util.Locale;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expone la carpeta física `uploads/` para acceso público
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/app/uploads/"); //Esta carpeta esta dentro del contenedor de docker asi que uso la ruta absoluta

        //Recordar que todo el proyecto esta dentro de un contenedor docker
    }


    //Esto lo pongo para que el locale sea el español y bean validation muestre los errores en ese idioma
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver localeResolver = new SessionLocaleResolver();
        localeResolver.setDefaultLocale(Locale.forLanguageTag("es"));
        return localeResolver;
    }
}
