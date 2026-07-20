package com.hotel.proyecto.proyecto_hotel.service;

import com.hotel.proyecto.proyecto_hotel.dto.request.UsuarioSave;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetUsuario;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import java.util.List;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface UsuarioService {
    GetUsuario save(UsuarioSave usuario);
    GetUsuario findById(Long id);
    GetUsuario findByCorreo(String correo);
    Page<GetUsuario> findAll(Pageable pageable);
    List<GetUsuario> findByRol(Rol rol);
    void deleteById(Long id);

}
