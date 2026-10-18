package com.hotel.proyecto.proyecto_hotel;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hotel.proyecto.proyecto_hotel.model.Usuario;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import com.hotel.proyecto.proyecto_hotel.repository.UsuarioRepository;
import com.hotel.proyecto.proyecto_hotel.service.UsuarioService;

import java.util.Optional;
import java.util.TimeZone;

@SpringBootApplication
@RequiredArgsConstructor 
@Slf4j 
public class ProyectoHotelApplication implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder;

    // Credenciales del administrador inicial: vienen de variables de entorno
    // (ADMIN_EMAIL / ADMIN_PASSWORD, vía application.properties). No hay valores por defecto.
    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
    }

    public static void main(String[] args) {
        SpringApplication.run(ProyectoHotelApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        //Guardando al usuario administrador inicial en caso de que no exista (arrancar por primera vez)

        //Sin credenciales configuradas no se crea ninguna cuenta: nunca hay una contraseña por defecto en el código
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("ADMIN_EMAIL y/o ADMIN_PASSWORD no están definidos: no se creará la cuenta de administrador");
            return;
        }

        String correoAdmin = adminEmail.trim();

        Optional<Usuario> usuarioAdmin = usuarioRepository.findByCorreo(correoAdmin);

        if(usuarioAdmin.isEmpty()){
            Usuario usuarioGuardar = Usuario.builder()
                .nombre("ADMIN")
                .apellido("ADMIN")
                .correo(correoAdmin)
                .clave(encoder.encode(adminPassword))
                .rol(Rol.ADMINISTRADOR)
            .build();

            usuarioRepository.save(usuarioGuardar);
            
            log.info("La cuenta de administrador ha sido creada correctamente");
            return;
        }

        log.info("La cuenta de administrador ya está registrada en la BD");
    }

}