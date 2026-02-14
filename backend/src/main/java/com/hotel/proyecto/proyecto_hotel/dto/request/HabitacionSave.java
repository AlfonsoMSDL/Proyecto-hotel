package com.hotel.proyecto.proyecto_hotel.dto.request;

import com.hotel.proyecto.proyecto_hotel.model.enums.TipoHabitacion;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HabitacionSave(

        @NotNull
        @Min(1)
        Integer numero,
        @NotNull
        TipoHabitacion tipoHabitacion,
        @NotNull
        @Min(1)
        Double precioNoche,
        @NotNull
        @Min(1)
        Integer capacidad,
        @NotBlank
        String descripcion
) {
}
