import { BACKEND_URL_BASE } from './config.js';

export async function login(email, password) {
  const userLogin = {
    "correo":email,
    "clave":password
  };

  const response = await fetch(BACKEND_URL_BASE+"/login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(userLogin)
  })

  if(!response.ok){
    const mensaje = await response.json();
    throw new Error(mensaje.error);
  }

  return response.json(); // Respondo con el token en formato Json
}


export async function register(data) {
  const usuarioGuardar = {
    "nombre":data.name,
    "apellido":data.lastName,
    "correo":data.email,
    "clave":data.password,
    "celular":data.phone

  };
  const response = await fetch(BACKEND_URL_BASE+"/usuarios",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(usuarioGuardar)
  })

  if(!response.ok){
    const mensaje = await response.json();
    throw new Error(mensaje.error);
  }

  return response.json(); // Respondo con los datos del usuario insertado
}
