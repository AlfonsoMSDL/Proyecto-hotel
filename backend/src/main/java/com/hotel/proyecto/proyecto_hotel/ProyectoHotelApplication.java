package com.hotel.proyecto.proyecto_hotel;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
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

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
    }

    public static void main(String[] args) {
        SpringApplication.run(ProyectoHotelApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        //Guardando al usuario administrador por defecto en caso de que no exista (arrancar por primera vez)

        Optional<Usuario> usuarioAdmin = usuarioRepository.findByCorreo("admin@gmail.com");

        if(usuarioAdmin.isEmpty()){
            Usuario usuarioGuardar = Usuario.builder()
                .nombre("ADMIN")
                .apellido("ADMIN")
                .celular("3045440396")
                .correo("admin@gmail.com")
                .clave(encoder.encode("admin"))
                .rol(Rol.ADMINISTRADOR)
            .build();

            usuarioRepository.save(usuarioGuardar);
            
            log.info("La cuenta de administrador ha sido creada correctamente");
            return;
        }

        log.info("La cuenta de administrador ya está registrada en la BD");
    }

}