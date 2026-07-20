package com.hotel.proyecto.proyecto_hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetHabitacion {
    private Long id;
    private Integer numero;
    private String tipoHabitacion;
    private Double precioNoche;
    private Integer capacidad;
    private String descripcion;
    private String estadoActual;
}
