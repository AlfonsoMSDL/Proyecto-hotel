package com.hotel.proyecto.proyecto_hotel.service.impl;

import com.hotel.proyecto.proyecto_hotel.dto.request.UsuarioSave;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetUsuario;
import com.hotel.proyecto.proyecto_hotel.exception.UsuarioRegistrarCorreoExistenteExcepcion;
import com.hotel.proyecto.proyecto_hotel.mapper.UsuarioMapper;
import com.hotel.proyecto.proyecto_hotel.model.Usuario;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import com.hotel.proyecto.proyecto_hotel.repository.UsuarioRepository;
import com.hotel.proyecto.proyecto_hotel.service.UsuarioService;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@AllArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private UsuarioRepository usuarioRepository;
    private UsuarioMapper usuarioMapper;
    private PasswordEncoder passwordEncoder;

    @Override
    public GetUsuario save(UsuarioSave usuarioSave) {
        //Primero verifico que el correo no este registrado en la BD
        boolean existeCorreo = usuarioRepository.existsByCorreo(usuarioSave.correo());
        if (existeCorreo) {
            //Lanzo una excepcion que diga que el correo ya existe
            throw new UsuarioRegistrarCorreoExistenteExcepcion("El correo ya está registrado");
        }
        //Mapeo el usuarioSave a un usuario para poder guardarlo en la bd
        Usuario usuario = usuarioMapper.toUsuarioFromUsuarioSave(usuarioSave);
        usuario.setRol(Rol.CLIENTE); //Establezco su rol
        //Encripto la clave con Spring security
        String claveEncriptada = passwordEncoder.encode( usuarioSave.clave());
        usuario.setClave(claveEncriptada);



        return usuarioMapper.toGetUsuario(
                usuarioRepository.save(usuario)
        );


    }

    @Override
    public GetUsuario findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        return usuarioMapper.toGetUsuario(usuario);
    }

    

    @Override
    public GetUsuario findByCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);
        return usuarioMapper.toGetUsuario(usuario);
    }

    @Override
    public Page<GetUsuario> findAll(Pageable pageable) {

        Page<Usuario> usuarios = usuarioRepository.findAll(pageable);


        return usuarios.map(usuarioMapper::toGetUsuario);
    }

    @Override
    public List<GetUsuario> findByRol(Rol rol) {
        return usuarioMapper.toGetUsuarioList(usuarioRepository.findByRol(rol));
    }

    @Override
    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }



}
