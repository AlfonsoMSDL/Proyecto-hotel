package com.hotel.proyecto.proyecto_hotel.dto.response;

public record GetUsuarioLogin(
         Long id,
         String nombre,
         String apellido,
         String correo,
         String rol
) {
}
