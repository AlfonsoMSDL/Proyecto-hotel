package com.hotel.proyecto.proyecto_hotel.config.secuity.filter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import com.hotel.proyecto.proyecto_hotel.model.Usuario;
import com.hotel.proyecto.proyecto_hotel.repository.UsuarioRepository;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class JpaUserDetailsService implements UserDetailsService{

    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        //Se va a buscar el usuario mediante en correo
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCorreo(correo);

        if(usuarioOptional.isEmpty()){ // Si no se encontro es que ese correo no esta registrado
            throw new UsernameNotFoundException(String.format("El correo %s no existe en el sistema", correo));

        }

        Usuario usuario = usuarioOptional.orElseThrow(); //Obtengo el usuario encontrado

        //Establezco la autoridad que permite darle cierto nivel a los usuarios
        //en este caso he designado al rol del usuario
        List<GrantedAuthority> authorities = Arrays.asList(new SimpleGrantedAuthority(usuario.getRol().name())); 

        //Creo un User de spring para que mas adelante lo valide con el que se envia en una peticion de login
        return new User(
            usuario.getCorreo(),
            usuario.getClave(),
            authorities);

    }

}
