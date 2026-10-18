package com.hotel.proyecto.proyecto_hotel.repository;

import com.hotel.proyecto.proyecto_hotel.model.Foto;
import com.hotel.proyecto.proyecto_hotel.model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Long> {

    void deleteByHabitacion(Habitacion habitacion);

    //Consulta para obtener todas las fotos de una habitacion
    @Query("""
                SELECT f FROM Foto f
                WHERE f.habitacion.id = :idHabitacion
            """)
    List<Foto> findByIdHabitacion(Long idHabitacion);


    Foto findFirstByHabitacionId(Long idHabitacion);
}
