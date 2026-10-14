package com.hotel.proyecto.proyecto_hotel;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.hotel.proyecto.proyecto_hotel.model.Usuario;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import com.hotel.proyecto.proyecto_hotel.repository.UsuarioRepository;

/**
 * El administrador inicial se crea solo con las credenciales de las variables de
 * entorno (ADMIN_EMAIL / ADMIN_PASSWORD); no existen credenciales por defecto.
 */
@ExtendWith(MockitoExtension.class)
class AdministradorInicialTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder encoder;

    private ProyectoHotelApplication app;

    @BeforeEach
    void setUp() {
        app = new ProyectoHotelApplication(usuarioRepository, encoder);
    }

    private void configurar(String correo, String clave) {
        ReflectionTestUtils.setField(app, "adminEmail", correo);
        ReflectionTestUtils.setField(app, "adminPassword", clave);
    }

    @Test
    void sinCorreoNoCreaNingunaCuenta() throws Exception {
        configurar("", "unaClave");

        app.run();

        verifyNoInteractions(usuarioRepository, encoder);
    }

    @Test
    void sinClaveNoCreaNingunaCuenta() throws Exception {
        configurar("admin@hotel.com", "");

        app.run();

        verifyNoInteractions(usuarioRepository, encoder);
    }

    @Test
    void conCredencialesCreaElAdministradorConLaClaveCifrada() throws Exception {
        configurar("  admin@hotel.com ", "claveSecreta");
        when(usuarioRepository.findByCorreo("admin@hotel.com")).thenReturn(Optional.empty());
        when(encoder.encode("claveSecreta")).thenReturn("HASH");

        app.run();

        ArgumentCaptor<Usuario> guardado = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(guardado.capture());
        assertEquals("admin@hotel.com", guardado.getValue().getCorreo());
        assertEquals(Rol.ADMINISTRADOR, guardado.getValue().getRol());
        assertEquals("HASH", guardado.getValue().getClave());
        assertNull(guardado.getValue().getCelular());
    }

    @Test
    void siElAdministradorYaExisteNoLoVuelveACrear() throws Exception {
        configurar("admin@hotel.com", "claveSecreta");
        when(usuarioRepository.findByCorreo("admin@hotel.com")).thenReturn(Optional.of(new Usuario()));

        app.run();

        verify(usuarioRepository, never()).save(any(Usuario.class));
        verifyNoInteractions(encoder);
    }
}
