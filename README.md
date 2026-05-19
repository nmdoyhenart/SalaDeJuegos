# 🎮 Sala de Juegos

Trabajo Práctico 1 | Primer Parcial **Programación IV**.

---

# Descripción del proyecto

“Sala de Juegos - 444” es una aplicación web desarrollada en Angular que permite a los usuarios registrarse, iniciar sesión y jugar distintos minijuegos para entretenerse.

La aplicación cuenta con:
- Sistema de autenticación.
- Distintos juegos.
- Sala de chat en tiempo real.
- Estadísticas por jugador.
- Diseño responsive y animaciones.
- Backend con Supabase.

---

# 🚀 Tecnologías utilizadas

## Frontend
- Angular
- TypeScript
- HTML
- CSS
- Bootstrap

## Backend
- Supabase

## Hosting
- Vercel
- Link: https://y-gold-sigma-23.vercel.app

---

# 🎮 Juegos desarollados

## ✅ Ahorcado
Adivinar palabras antes de quedarse sin intentos.

## ✅ Mayor o Menor
El usuario deberá adivinar si la siguiente carta/número será mayor o menor.

## ✅ Preguntados
Preguntas y respuestas con puntaje.

## ✅ Juego Propio
Snake.

---

# 💬 Sala de Chat

La aplicación contará con un chat global en tiempo real donde todos los usuarios **registrados** podrán enviar y recibir mensajes automáticamente sin recargar la página.

---

# 📊 Estadísticas

Se almacenarán:
- Puntajes
- Tiempo de juego
- Victorias y derrotas
- Estadísticas individuales por juego

---

# 📅 Roadmap por Sprints

---

# ✅ Sprint 1

## Objetivos
- [x] Deploy del proyecto
- [x] Navegación entre componentes

## Componentes
- [x] Login
- [x] Registro
- [x] Home
- [x] Quién Soy

## Funcionalidades
- [x] Consumo de API de GitHub
- [x] Mostrar información del alumno
- [x] Explicación del juego propio

## API utilizada
GitHub Users API:

```bash
https://api.github.com/users/nmdoyhenart
```

---

# ✅ Sprint #2

## Objetivos

- [ ] Implementar autenticación completa
- [ ] Mejorar comportamiento dinámico del Home
- [ ] Implementar login rápido
- [ ] Completar lógica de registro
- [ ] Manejo de sesiones
- [ ] Validaciones y mensajes de error

---

# 🧩 Funcionalidades desarrolladas

## ✅ Home / Bienvenida

- Acceso centralizado a juegos y listados.
- Navegación principal de la aplicación.

### Comportamiento según autenticación

#### Usuario NO logueado
- Mostrar botón de:
  - Login
  - Registro

#### Usuario logueado
- Mostrar:
  - Nombre del usuario
  - Botón de cerrar sesión

---

## ✅ Inicio de Sesión

### Funcionalidades
- Validación contra Supabase/Firebase.
- Inicio de sesión mediante:
  - Email
  - Contraseña

### Comportamiento
- Login exitoso:
  - Redirección automática al Home.

- Login fallido:
  - Mostrar mensaje de error correspondiente.

### Login rápido
La pantalla contará con:
- 3 botones de acceso rápido
- Usuarios preconfigurados para pruebas ágiles

---

## ✅ Registro de Usuarios

### Datos solicitados
- Nombre
- Apellido
- Edad
- Correo electrónico
- Contraseña

### Funcionalidades
- Creación de usuario en Authentication.
- Guardado de datos en base de datos.
- Inicio automático de sesión luego del registro.
- Redirección automática al Home.
- Validación de usuario ya registrado.

> ⚠️ La contraseña NO se almacena en la base de datos.

# Desarollado por: Nicolás Doyhenart - 2026
