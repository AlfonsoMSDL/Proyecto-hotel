package com.hotel.proyecto.proyecto_hotel.dto.request;

import java.sql.Timestamp;

import jakarta.validation.constraints.NotNull;

public record SaveReserva(
        @NotNull
        Long idHabitacion,
        @NotNull
        Timestamp fechaLlegada,
        @NotNull
        Timestamp fechaSalida
) {
}
