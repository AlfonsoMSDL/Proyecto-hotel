package com.hotel.proyecto.proyecto_hotel.service;

import com.hotel.proyecto.proyecto_hotel.dto.request.UsuarioSave;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetUsuario;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import java.util.List;
public interface UsuarioService {
    GetUsuario save(UsuarioSave usuario);
    GetUsuario  findById(Long id);
    List<GetUsuario> findAll();
    List<GetUsuario> findByRol(Rol rol);
    void deleteById(Long id);

}
