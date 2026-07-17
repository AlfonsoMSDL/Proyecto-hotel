package com.hotel.proyecto.proyecto_hotel.controller;

import com.hotel.proyecto.proyecto_hotel.dto.request.SaveReserva;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetHistorialReserva;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetReserva;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetUsuario;
import com.hotel.proyecto.proyecto_hotel.service.ReservaService;
import com.hotel.proyecto.proyecto_hotel.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservas")
@AllArgsConstructor
public class ReservaController {
    private ReservaService reservaService;
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody SaveReserva reserva, BindingResult bindingResult, @AuthenticationPrincipal String correo){

        if(bindingResult.hasFieldErrors()){
            return getErrors(bindingResult);
        }
        GetUsuario usuario = usuarioService.findByCorreo(correo);
        GetReserva reservaGuardada =  reservaService.save(reserva, usuario.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaGuardada);
    }

    @GetMapping("/habitaciones/{idHabitacion}")
    public ResponseEntity<List<GetReserva>> buscarReservasConfirmadasPorHabitacion(@PathVariable Long idHabitacion){
        List<GetReserva> reservas = reservaService.buscarReservasConfirmadasPorHabitacion(idHabitacion);
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/mis_reservas")
    public ResponseEntity<?> historialReservasPorUsuarioYEstadoReserva(@AuthenticationPrincipal String correo, @RequestParam String estado){

        System.out.println("Correo: "+correo);

        GetUsuario usuario = usuarioService.findByCorreo(correo);

        List<GetHistorialReserva> historialReservas = reservaService.historialReservasPorUsuarioYEstadoReserva(usuario.id(),estado);

        return ResponseEntity.ok(historialReservas);
    }

    @PutMapping("/cancelar/{id}")
    public ResponseEntity<Void >cancelarReserva(@PathVariable Long id, @AuthenticationPrincipal String correo){
        reservaService.cancelarReserva(id, correo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/clientes/{nombreCompleto}")
    public ResponseEntity<List<GetReserva>> buscarReservasDeClienteDadoNumHabitacion(@PathVariable String nombreCompleto, @PathVariable Integer numHabitacion){

        List<GetReserva> reservas = reservaService.buscarReservasDeClienteDadoNombreCompleto(nombreCompleto);

        return ResponseEntity.ok(reservas);
    }

    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    @PostMapping("/marcar-entrada/{idReserva}")
    public ResponseEntity<?> marcarEntrada(@PathVariable Long idReserva){

        reservaService.marcarEntrada(idReserva);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    @PostMapping("/marcar-salida/{idReserva}")
    public ResponseEntity<?> marcarSalida(@PathVariable Long idReserva){

        reservaService.marcarSalida(idReserva);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
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
