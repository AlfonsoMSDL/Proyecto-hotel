package com.hotel.proyecto.proyecto_hotel.controller;

import com.hotel.proyecto.proyecto_hotel.dto.request.UsuarioSave;
import com.hotel.proyecto.proyecto_hotel.dto.response.GetUsuario;
import com.hotel.proyecto.proyecto_hotel.model.enums.Rol;
import com.hotel.proyecto.proyecto_hotel.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

//Este controlador va a manejar la api para la gestion de usuarios (Cliente y Administrador)
@Slf4j
@RestController
@RequestMapping("/usuarios")
@AllArgsConstructor
public class UsuarioController {
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> save(@Valid @RequestBody UsuarioSave usuarioSave, BindingResult bindingResult) {

        if(bindingResult.hasFieldErrors()){
            return getErrors(bindingResult);
        }
        GetUsuario usuario = usuarioService.save(usuarioSave);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    

    @GetMapping
    public List<GetUsuario> findAll() {
        return  usuarioService.findAll();
    }

    @GetMapping("/byRol/{rol}")
    public List<GetUsuario> findByRol(@PathVariable Rol rol) {
        return  usuarioService.findByRol(rol);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id){
        usuarioService.deleteById(id);
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
