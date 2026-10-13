package com.hotel.proyecto.proyecto_hotel.service.impl;

import com.hotel.proyecto.proyecto_hotel.dto.request.SaveReserva;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetHistorialReserva;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetReserva;
import com.hotel.proyecto.proyecto_hotel.exception.EstadoHabitacionInvalidoException;
import com.hotel.proyecto.proyecto_hotel.exception.EstadoReservaInvalidoException;
import com.hotel.proyecto.proyecto_hotel.exception.FechaLlegadaNoIgualFechaActualException;
import com.hotel.proyecto.proyecto_hotel.exception.FechasReservaInvalidasException;
import com.hotel.proyecto.proyecto_hotel.exception.ReservaCruzadaException;
import com.hotel.proyecto.proyecto_hotel.exception.ReservaNoEncontradaException;
import com.hotel.proyecto.proyecto_hotel.mapper.ReservaMapper;
import com.hotel.proyecto.proyecto_hotel.model.*;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import com.hotel.proyecto.proyecto_hotel.repository.HabitacionRepository;
import com.hotel.proyecto.proyecto_hotel.repository.ReservaRepository;
import com.hotel.proyecto.proyecto_hotel.repository.UsuarioRepository;
import com.hotel.proyecto.proyecto_hotel.service.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class ReservaServiceImpl implements ReservaService {
    private ReservaRepository reservaRepository;
    private ReservaMapper reservaMapper;
    private UsuarioRepository  usuarioRepository;
    private HabitacionRepository habitacionRepository;
    private EstadoReservaService  estadoReservaService;
    private EstadoDeLaReservaService estadoDeLaReservaService;
    private EstadoHabitacionService  estadoHabitacionService;
    private EstadoDeLaHabitacionService estadoDeLaHabitacionService;

    @Transactional
    @Override
    public GetReserva save(SaveReserva reserva, Long idUsuario) throws ReservaCruzadaException, FechasReservaInvalidasException{
        //Primero mapeo el SaveReserva a una Reserva
        Reserva reservaGuardar = reservaMapper.toReservaFromSaveReserva(reserva);
        //Comparo que la fecha de salida no sea menor a la fecha de llegada
        if(reservaGuardar.getFechaLlegada().after(reservaGuardar.getFechaSalida())){
            throw new FechasReservaInvalidasException("La fecha de salida es menor a la fecha de llegada.");
        }
        //Busco el usuario para agregarselo a la reserva (el usuario autenticado, no uno enviado por el cliente)
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        log.info("Usuario que va a reservar: "+usuario);
        //Le agrego el usuario a la reserva
        reservaGuardar.setUsuario(usuario);
        //Hago lo mismo para la habitacion
        Habitacion habitacion = habitacionRepository.findById(reserva.idHabitacion()).orElse(null);
        log.info("Habitacion que va a reservar: "+habitacion);
        reservaGuardar.setHabitacion(habitacion);

        //Hasta este punto la reserva esta lista para ser guardada en la bd
        //Ahora hay que comprobar que las fechas de entrada y salidas esten disponibles para reservar
        Optional<Reserva> reservaCruzada = reservaRepository.encontrarReservaCruzada(
                reservaGuardar.getHabitacion().getId(),
                reservaGuardar.getFechaLlegada(),
                reservaGuardar.getFechaSalida()
        );

        //Si la reserva cruzada tiene un objeto significa que la reserva que trato de
        // guardar, se cruza con otra reserva anterior
        if(reservaCruzada.isPresent()) {
            log.info("Esta reserva se cruza con otra que fue hecha previamente por otro cliente");
            throw new ReservaCruzadaException("Esta reserva se cruza con otra que fue hecha previamente por otro cliente");
        }
        //Si no se cruza con ninguna, procedemos a guardar la reserva en la bd
        Reserva reservaGuardada = reservaRepository.save(reservaGuardar);
        log.info("Reserva guardada correctamente "+reservaGuardada);

        //Traigo el estado de reserva Confirmada, para agregar la resera a estados de la reserva
        EstadoReserva estadoReserva = estadoReservaService.findByNombre("Confirmada");

        //Teniendo la resera creada y el estado que se le va a poner a la reserva
        // Procedemos a insertar un estado de la reserva, que relacione el estado
        // con la reserva
        EstadoDeLaReserva estadoDeLaReserva = new EstadoDeLaReserva();
        estadoDeLaReserva.setId(new EstadoDeLaReservaId());
        estadoDeLaReserva.setEstadoReserva(estadoReserva);
        estadoDeLaReserva.setReserva(reservaGuardar);
        estadoDeLaReserva.setFechaInicio(Timestamp.valueOf(LocalDateTime.now()));

        //Guardo el estado de la reserva creada
        estadoDeLaReservaService.save(estadoDeLaReserva);
        log.info("Estado de la reserva guardada correctamente "+estadoDeLaReserva);


        return reservaMapper.toGetReserva(reservaGuardada);
    }
    public Reserva findById(Long id) {return reservaRepository.findById(id).orElse(null);}

    //Este metodo lo voy a usar para filtrar por las reservas completadas de una habitacion
    @Override
    public List<GetReserva> buscarReservasConfirmadasPorHabitacion(Long idHabitacion) {
        List<Reserva> reservas = reservaRepository.findReservasConfirmadasActualesPorHabitacion(idHabitacion);
        return reservaMapper.toGetReservaList(reservas);
    }

    @Override
    @Transactional
    public List<GetHistorialReserva> historialReservasPorUsuarioYEstadoReserva(Long idUsuario, String estado) {
        List<Reserva> reservas = reservaRepository.findHistorialReservasPorUsuarioYEstado(idUsuario,estado);

        return reservas.stream()
                .map(r ->
                    new GetHistorialReserva(
                        r.getId(),
                        r.getHabitacion().getNumero(),
                        r.getFechaLlegada(),
                        r.getFechaSalida(),
                        estado)
                )
                .toList();
    }

    @Override
    @Transactional
    public void cancelarReserva(Long idReserva, String correoSolicitante) {
        // 1. Buscar la reserva (404 si no existe)
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ReservaNoEncontradaException("No se encontró la reserva con ID: " + idReserva));
        log.info("Reserva a cancelar \n{}", reserva);

        // 2. Solo el dueño de la reserva o un administrador pueden cancelarla
        Usuario solicitante = usuarioRepository.findByCorreo(correoSolicitante).orElse(null);
        boolean esDueño = reserva.getUsuario() != null && reserva.getUsuario().getCorreo().equals(correoSolicitante);
        boolean esAdministrador = solicitante != null && solicitante.getRol() == Rol.ADMINISTRADOR;
        if (!esDueño && !esAdministrador) {
            throw new AccessDeniedException("No tienes permiso para cancelar esta reserva");
        }

        // 3. Validar que la reserva esté en estado Confirmada
        EstadoDeLaReserva estadoActualReserva = estadoDeLaReservaService.findByReservaAndFechaFinIsNull(reserva);
        if (estadoActualReserva == null || !"Confirmada".equalsIgnoreCase(estadoActualReserva.getEstadoReserva().getNombre())) {
            throw new EstadoReservaInvalidoException("Solo se pueden cancelar reservas en estado 'Confirmada'. Estado actual: "
                    + (estadoActualReserva != null ? estadoActualReserva.getEstadoReserva().getNombre() : "Sin estado"));
        }

        Timestamp ahora = Timestamp.valueOf(LocalDateTime.now());

        // 4. Cerrar el estado actual de la reserva
        estadoActualReserva.setFechaFin(ahora);
        estadoDeLaReservaService.save(estadoActualReserva);

        // 5. Crear el nuevo estado de la reserva Cancelada
        EstadoReserva estadoReservaCancelada = estadoReservaService.findByNombre("Cancelada");
        EstadoDeLaReserva nuevoEstadoReserva = new EstadoDeLaReserva();
        nuevoEstadoReserva.setId(new EstadoDeLaReservaId());
        nuevoEstadoReserva.setEstadoReserva(estadoReservaCancelada);
        nuevoEstadoReserva.setReserva(reserva);
        nuevoEstadoReserva.setFechaInicio(ahora);
        estadoDeLaReservaService.save(nuevoEstadoReserva);
        log.info("Se canceló la reserva correctamente");
    }

    @Override
    public List<GetReserva> buscarReservasDeClienteDadoNombreCompleto(String nombreCompleto) {
        List<Reserva> reservas = reservaRepository.buscarReservasDeClienteDadoNombreCompleto(nombreCompleto);
        return reservaMapper.toGetReservaList(reservas);
    }

    @Override
    @Transactional
    public void marcarEntrada(Long idReserva) throws FechaLlegadaNoIgualFechaActualException {
        // 1. Buscar la reserva (404 si no existe)
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ReservaNoEncontradaException("No se encontró la reserva con ID: " + idReserva));
        log.info("Reserva a marcar entrada {}", reserva);

        // 2. Validar que la reserva esté en estado Confirmada (409 si no)
        EstadoDeLaReserva estadoActualReserva = estadoDeLaReservaService.findByReservaAndFechaFinIsNull(reserva);
        if (estadoActualReserva == null || !"Confirmada".equalsIgnoreCase(estadoActualReserva.getEstadoReserva().getNombre())) {
            throw new EstadoReservaInvalidoException("Solo se puede marcar entrada para reservas en estado 'Confirmada'. Estado actual: "
                    + (estadoActualReserva != null ? estadoActualReserva.getEstadoReserva().getNombre() : "Sin estado"));
        }

        // 3. Validar que la fecha de llegada sea igual a la fecha actual en America/Bogota
        ZoneId zonaHotel = ZoneId.of("America/Bogota");
        LocalDate fechaActual = LocalDate.now(zonaHotel);
        LocalDate fechaLlegada = reserva.getFechaLlegada()
                                        .toInstant()
                                        .atZone(zonaHotel)
                                        .toLocalDate();
        log.info("Fecha de llegada {}", fechaLlegada);
        log.info("Fecha de actual {}", fechaActual);

        if (!fechaActual.equals(fechaLlegada)) {
            log.info("La fecha de llegada debe ser igual a la fecha actual para que se pueda marcar la entrada.");
            throw new FechaLlegadaNoIgualFechaActualException("La fecha de llegada debe ser igual a la fecha actual para que se pueda marcar la entrada.");
        }

        // 4. Validar el estado actual de la habitación
        Habitacion habitacion = reserva.getHabitacion();
        EstadoDeLaHabitacion estadoActualHabitacion = estadoDeLaHabitacionService.findByHabitacionAndFechaFinIsNull(habitacion);
        if (estadoActualHabitacion == null || !"Disponible".equalsIgnoreCase(estadoActualHabitacion.getEstadoHabitacion().getNombre())) {
            throw new EstadoHabitacionInvalidoException("La habitación no se encuentra disponible para marcar entrada. Estado actual: "
                    + (estadoActualHabitacion != null ? estadoActualHabitacion.getEstadoHabitacion().getNombre() : "Sin estado"));
        }

        Timestamp ahora = Timestamp.valueOf(LocalDateTime.now());

        // 5. Cerrar el estado actual de la habitación (Disponible)
        estadoActualHabitacion.setFechaFin(ahora);
        estadoDeLaHabitacionService.save(estadoActualHabitacion);

        // 6. Asignar nuevo estado Ocupada a la habitación
        EstadoHabitacion estadoOcupada = estadoHabitacionService.findByNombre("Ocupada");
        EstadoDeLaHabitacion nuevoEstadoHabitacion = new EstadoDeLaHabitacion();
        nuevoEstadoHabitacion.setHabitacion(habitacion);
        nuevoEstadoHabitacion.setEstadoHabitacion(estadoOcupada);
        nuevoEstadoHabitacion.setFechaInicio(ahora);
        estadoDeLaHabitacionService.save(nuevoEstadoHabitacion);
        log.info("Se guardó el nuevo estado de la habitación a Ocupada");
    }

    @Override
    @Transactional
    public void marcarSalida(Long idReserva) {
        // 1. Buscar la reserva (404 si no existe)
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ReservaNoEncontradaException("No se encontró la reserva con ID: " + idReserva));
        log.info("Reserva a marcar salida {}", reserva);

        // 2. Validar que la reserva esté en estado Confirmada para poder completarla
        EstadoDeLaReserva estadoActualReserva = estadoDeLaReservaService.findByReservaAndFechaFinIsNull(reserva);
        if (estadoActualReserva == null || !"Confirmada".equalsIgnoreCase(estadoActualReserva.getEstadoReserva().getNombre())) {
            throw new EstadoReservaInvalidoException("Solo se puede marcar salida para reservas en estado 'Confirmada'. Estado actual: "
                    + (estadoActualReserva != null ? estadoActualReserva.getEstadoReserva().getNombre() : "Sin estado"));
        }

        // 3. Validar que la habitación se encuentre actualmente en estado Ocupada
        Habitacion habitacion = reserva.getHabitacion();
        EstadoDeLaHabitacion estadoActualHabitacion = estadoDeLaHabitacionService.findByHabitacionAndFechaFinIsNull(habitacion);
        if (estadoActualHabitacion == null || !"Ocupada".equalsIgnoreCase(estadoActualHabitacion.getEstadoHabitacion().getNombre())) {
            throw new EstadoHabitacionInvalidoException("La habitación no se encuentra en estado 'Ocupada' para marcar salida. Estado actual: "
                    + (estadoActualHabitacion != null ? estadoActualHabitacion.getEstadoHabitacion().getNombre() : "Sin estado"));
        }

        Timestamp ahora = Timestamp.valueOf(LocalDateTime.now());

        // 4. Cerrar el estado anterior de la reserva (Confirmada)
        estadoActualReserva.setFechaFin(ahora);
        estadoDeLaReservaService.save(estadoActualReserva);

        // 5. Crear el nuevo estado de la reserva Completada
        EstadoReserva estadoCompletada = estadoReservaService.findByNombre("Completada");
        EstadoDeLaReserva nuevoEstadoReserva = new EstadoDeLaReserva();
        nuevoEstadoReserva.setId(new EstadoDeLaReservaId());
        nuevoEstadoReserva.setEstadoReserva(estadoCompletada);
        nuevoEstadoReserva.setReserva(reserva);
        nuevoEstadoReserva.setFechaInicio(ahora);
        estadoDeLaReservaService.save(nuevoEstadoReserva);
        log.info("La reserva pasa a estado Completada");

        // 6. Cerrar el estado actual de la habitación (Ocupada)
        estadoActualHabitacion.setFechaFin(ahora);
        estadoDeLaHabitacionService.save(estadoActualHabitacion);

        // 7. Crear el nuevo estado de la habitación Disponible
        EstadoHabitacion estadoDisponible = estadoHabitacionService.findByNombre("Disponible");
        EstadoDeLaHabitacion nuevoEstadoHabitacion = new EstadoDeLaHabitacion();
        nuevoEstadoHabitacion.setHabitacion(habitacion);
        nuevoEstadoHabitacion.setEstadoHabitacion(estadoDisponible);
        nuevoEstadoHabitacion.setFechaInicio(ahora);
        estadoDeLaHabitacionService.save(nuevoEstadoHabitacion);
        log.info("La habitación pasa a estado Disponible");
    }
}
