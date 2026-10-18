package com.hotel.proyecto.proyecto_hotel.controller;

import com.hotel.proyecto.proyecto_hotel.dto.request.HabitacionSave;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetFoto;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetHabitacion;
import com.hotel.proyecto.proyecto_hotel.model.enums.TipoHabitacion;
import com.hotel.proyecto.proyecto_hotel.service.HabitacionService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/habitaciones")
@AllArgsConstructor
public class HabitacionController {
    private HabitacionService habitacionService;

    @GetMapping
    public ResponseEntity<Page<GetHabitacion>> listar(Pageable pageable) {
        return ResponseEntity.ok(habitacionService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(habitacionService.findById(id));
    }

    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<?> guardar( @Valid
            @ModelAttribute HabitacionSave habitacionSave, BindingResult bindingResult,
            @RequestParam(required = false) List<MultipartFile> imagenes) {

        if(bindingResult.hasFieldErrors()){
            return getErrors(bindingResult);
        }

        GetHabitacion habitacion = habitacionService.save(habitacionSave, imagenes);
        return ResponseEntity.status(HttpStatus.CREATED).body(habitacion);
    }

    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id){

        if(!habitacionService.existePorId(id)){
            log.info("Habitacion con id {} no encontrada", id);
            return ResponseEntity.notFound().build();
        }

        habitacionService.deleteById(id);
        return ResponseEntity.noContent().build();

    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<GetHabitacion>> filtrarPorTipo(@PathVariable TipoHabitacion tipo) {
        List<GetHabitacion> habitaciones = habitacionService.filtrarPorTipoHabitacion(tipo);
        return ResponseEntity.ok(habitaciones);
    }

    @GetMapping("/precio")
    public ResponseEntity<List<GetHabitacion>> filtrarPorRangoDePrecio(@RequestParam Double precioMinimo,@RequestParam Double precioMaximo) {

        List<GetHabitacion> habitaciones = habitacionService.filtrarPorRangoDePrecio(precioMinimo,precioMaximo);
        return ResponseEntity.ok(habitaciones);
    }

    @GetMapping("/disponibilidad_fecha")
    public ResponseEntity<List<GetHabitacion>> filtrarPorDisponibilidadDeFechas(@RequestParam Timestamp fechaLlegada, @RequestParam Timestamp fechaSalida){
        List<GetHabitacion> habitaciones = habitacionService.filtrarPorDisponibilidadDeFechas(fechaLlegada,fechaSalida);

        return ResponseEntity.ok(habitaciones);
    }

    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    @PostMapping("/{idHabitacion}/fotos")
    public ResponseEntity<GetFoto> agregarFotoAHabitacion(@RequestParam(required = false) MultipartFile imagen, @PathVariable Long idHabitacion) {

        GetFoto fotoGuardada = habitacionService.agregarFotoAHabitacion(idHabitacion,imagen);
        return ResponseEntity.status(HttpStatus.CREATED).body(fotoGuardada);
    }

    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<GetHabitacion> actualizarHabitacion(@RequestBody HabitacionSave habitacionSave,@PathVariable Long id){
        GetHabitacion habitacionActualizada = habitacionService.updateHabitacion(habitacionSave,id);
        return ResponseEntity.ok(habitacionActualizada);
    }

    private ResponseEntity<?> getErrors(BindingResult bindingResult) {
        Map<String,String> errores = new HashMap<>();
        bindingResult.getFieldErrors()
        .forEach(err -> {
            errores.put(err.getField(), "El campo "+err.getField()+" "+err.getDefaultMessage());
        });

        return ResponseEntity.badRequest().body(errores);
    }

}
