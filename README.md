# AppUnTN - Frontend

Plataforma web universitaria para compartir y explorar resumenes academicos. Desarrollada con **Angular 20** como parte de la materia Programacion 4 en la UTN.

---

## Tecnologias

| Tecnologia | Version |
|---|---|
| Angular | 20.3.x |
| TypeScript | 5.9.2 |
| RxJS | 7.8.x |
| Angular CLI | 20.3.6 |
| Build Tool | Vite |

### Patrones y features de Angular utilizados

- **Standalone Components** (sin NgModules)
- **Signals y Computed Signals** para manejo de estado reactivo
- **Zoneless Change Detection** (`provideZonelessChangeDetection`)
- **Functional Guards e Interceptors** (`CanActivateFn`, `HttpInterceptorFn`)
- **Reactive Forms** con validadores async (debounced)

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- Angular CLI (`npm install -g @angular/cli`)
- Backend de AppUnTN corriendo en `http://localhost:8080`

---

## Instalacion y ejecucion

```bash
git clone <url-del-repo>
cd Frontend
npm install
ng serve
```

La aplicacion estara disponible en `http://localhost:4200`.

---

## Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm start` | Levanta el servidor de desarrollo (port 4200) |
| `npm run build` | Genera el build de produccion |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | Ejecuta los tests (Jasmine + Karma) |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── header/            # Navbar de navegacion
│   │   └── footer/            # Footer
│   │
│   ├── pages/
│   │   ├── home/              # Pagina principal
│   │   ├── about-us/          # Informacion sobre la app
│   │   ├── login/             # Inicio de sesion
│   │   ├── register/          # Registro de usuarios
│   │   ├── profile/           # Perfil del usuario logueado
│   │   ├── user-profile/      # Perfil publico de otro usuario
│   │   ├── resume-upload/     # Subir resumenes
│   │   ├── documents/         # Explorar resumenes
│   │   ├── document-preview/  # Vista previa de un resumen
│   │   ├── admin-admins/      # Panel: gestionar admins
│   │   ├── admin-usuarios/    # Panel: gestionar usuarios
│   │   └── admin-academico/   # Panel: universidades/carreras/materias
│   │
│   ├── services/
│   │   ├── auth.ts            # Autenticacion y manejo de JWT
│   │   ├── user-service.ts    # Operaciones de usuario y perfil
│   │   └── document.service.ts # Documentos, comentarios, puntuaciones
│   │
│   ├── guards/
│   │   └── auth-guard.ts      # Proteccion de rutas (requiere login)
│   │
│   ├── interceptors/
│   │   └── auth.interceptor.ts # Manejo global de errores 401
│   │
│   ├── app.ts                 # Componente raiz
│   ├── app.routes.ts          # Definicion de rutas
│   └── app.config.ts          # Configuracion de providers
│
├── environments/
│   └── environment.ts         # URL del backend (apiUrl)
│
├── styles.css                 # Estilos globales
└── main.ts                    # Bootstrap de la app
```

---

## Rutas y paginas

### Publicas

| Ruta | Componente | Descripcion |
|---|---|---|
| `/home` | Home | Landing page con navegacion principal |
| `/aboutUs` | AboutUs | Informacion sobre AppUnTN |
| `/login` | Login | Formulario de inicio de sesion |
| `/register` | Register | Formulario de registro con validacion async |

### Protegidas (requieren autenticacion)

| Ruta | Componente | Acceso | Descripcion |
|---|---|---|---|
| `/resumeUpload` | ResumeUpload | Todos | Subir resumenes con seleccion cascading de materia |
| `/documents` | Documents | Todos | Explorar y filtrar resumenes |
| `/document-preview/:id` | DocumentPreview | Todos | Ver resumen, descargar, comentar y puntuar |
| `/profile` | Profile | Todos | Perfil propio, editar datos, ver documentos |
| `/user-profile/:username` | UserProfile | Todos | Ver perfil publico de otro usuario |
| `/admin-admins` | AdminAdmins | ADMIN | Gestionar administradores |
| `/admin-usuarios` | AdminUsuarios | ADMIN | Gestionar usuarios (cambiar roles, eliminar) |
| `/admin-academico` | AdminAcademico | ADMIN | CRUD de universidades, carreras y materias |

---

## Roles y permisos

### STUDENT (Alumno)
- Subir resumenes
- Explorar y descargar resumenes
- Comentar y puntuar documentos
- Editar su perfil
- Solicitar cambio de rol a Profesor

### PROFESSOR (Profesor)
- Todo lo de STUDENT, mas:
- Vincularse a materias (seleccion cascading: Universidad > Carrera > Materia)
- Desvincularse de materias

### ADMIN (Administrador)
- Todo lo de PROFESSOR, mas:
- Gestionar usuarios (cambiar roles, eliminar)
- Gestionar administradores
- CRUD completo de Universidades, Carreras y Materias
- Moderar comentarios (eliminar cualquier comentario)
- Eliminar cualquier documento

---

## Servicios

### Auth (`services/auth.ts`)
Manejo de autenticacion basado en JWT.

- `login(token)` / `logout()` -- Almacena/elimina el token en localStorage
- `getToken()` / `getUsername()` / `getRole()` -- Decodifica el JWT
- `isLoggedIn()` -- Verifica que el token exista y no este expirado
- `isTokenExpired(token)` -- Chequea la claim `exp` del JWT
- Validacion del token contra el backend al iniciar la app (`/users/me`)
- Estado reactivo con `signal<boolean>` (`isLoggedInSignal`)

### UserService (`services/user-service.ts`)
Operaciones de usuario, perfil y datos academicos.

- Registro y login
- Validacion async de email/username unicos
- Obtener y actualizar perfil
- Gestionar materias del profesor (agregar/eliminar)
- Obtener documentos propios
- Datos academicos cascading (universidades, carreras, materias)

### DocumentService (`services/document.service.ts`)
Operaciones sobre documentos, comentarios y puntuaciones.

- Listar documentos (con ordenamiento: recientes, puntuados, descargados)
- Obtener documento por ID
- Descargar archivo (respuesta blob)
- Filtrar por materia
- CRUD de comentarios
- CRUD de puntuaciones (1-5 estrellas)

---

## Seguridad

### Autenticacion JWT
- El token se almacena en `localStorage` al hacer login
- Se decodifica para obtener username, rol y expiracion
- Al iniciar la app, se valida el token contra `GET /api/users/me`
- Si el backend esta caido o el token es invalido, se hace logout automatico

### AuthGuard (`guards/auth-guard.ts`)
- Protege todas las rutas que requieren login
- Verifica que el token exista y no este expirado
- Redirige a `/login` si no esta autenticado

### AuthInterceptor (`interceptors/auth.interceptor.ts`)
- Intercepta todas las respuestas HTTP
- Si recibe un **401 Unauthorized**, hace logout automatico y redirige a `/login`

---

## Configuracion

El URL del backend se configura en `src/environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

Para cambiar el backend (ej: produccion), modificar este archivo o crear `environment.prod.ts`.

---

## Features destacadas

- **Seleccion cascading**: Universidad > Carrera > Materia en subida de resumenes, perfil de profesor y panel academico
- **Filtros avanzados**: Busqueda por nombre, autor, materia con seleccion cascading en la pagina de explorar
- **Sistema de puntuaciones**: Rating de 1-5 estrellas por documento con promedio
- **Comentarios**: Sistema de comentarios con moderacion de admin
- **Edicion inline**: En el panel academico, editar universidades/carreras/materias sin salir de la tabla
- **Validacion async**: Email y username se validan contra el backend en tiempo real (debounce 400ms)
- **Responsive**: Todas las paginas adaptadas para mobile y tablet

---

## Conexion con el Backend

Este frontend se conecta al backend de AppUnTN (Spring Boot) que debe estar corriendo en `http://localhost:8080`.

| Prefijo | Descripcion |
|---|---|
| `/api/auth` | Login (JWT) |
| `/api/users` | Registro, perfil, materias del profesor |
| `/api/documents` | CRUD de documentos, descarga |
| `/api/commentaries` | Comentarios en documentos |
| `/api/punctuations` | Puntuaciones/ratings |
| `/api/admin/universities` | CRUD universidades (admin) |
| `/api/admin/careers` | CRUD carreras (admin) |
| `/api/admin/subjects` | CRUD materias (admin) |
