package com.hotel.proyecto.proyecto_hotel.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UsuarioLogin(
    @NotBlank
    String clave,
    @NotBlank
    String correo
) {

}
