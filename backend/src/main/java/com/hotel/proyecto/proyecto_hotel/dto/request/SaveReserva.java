package com.hotel.proyecto.proyecto_hotel.dto.request;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

public record SaveReserva(
        @NotNull
        Long idHabitacion,
        @NotNull
        @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "America/Bogota")
        Timestamp fechaLlegada,
        @NotNull
        @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "America/Bogota")
        Timestamp fechaSalida
) {
}
