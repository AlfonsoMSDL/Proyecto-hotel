package com.hotel.proyecto.proyecto_hotel.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioSave(
        @NotBlank
        String nombre,
        @NotBlank
        String apellido,
        @NotBlank
        @Email
        String correo,
        @NotBlank
        String celular,
        @NotBlank
        String clave
) {
}
