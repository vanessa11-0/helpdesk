# Mesa de Ayuda — Frontend Angular

Interfaz en Angular 17 para la API de tickets de soporte
[`https://sla-api.areasoftccyt.com/api`](https://sla-api.areasoftccyt.com/api/docs).
El backend ya está desplegado; este proyecto sólo lo consume.

## Puesta en marcha

```bash
npm install
npm start
```

La aplicación queda en `http://localhost:4200/`.

| Comando | Qué hace |
| --- | --- |
| `npm start` | Servidor de desarrollo con el proxy hacia la API |
| `npm run build` | Compilación de producción (`dist/helpdesk-app`) |
| `npm test` | Pruebas unitarias con Karma |

### Credenciales de prueba

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin@helpdesk.dev` | `Admin123!` |
| Agente | `agent1@helpdesk.dev` | `Agent123!` |
| Cliente | `client1@helpdesk.dev` | `Client123!` |

Los datos del servidor se reinician cada vez que el backend se reinicia, así que
no hay IDs fijos con los que contar.

## Environment y proxy

En desarrollo `environment.apiUrl` vale `/api`, una ruta **relativa**: el
`proxy.conf.json` reenvía todo lo que empiece por `/api` al backend, de modo que
el navegador ve las peticiones como del mismo origen y no hay CORS.

```json
{
  "/api": {
    "target": "https://sla-api.areasoftccyt.com",
    "secure": true,
    "changeOrigin": true
  }
}
```

En producción no hay proxy, así que `environment.prod.ts` apunta directo al
backend desplegado. El cambio de archivo lo hace `angular.json` mediante
`fileReplacements` en la configuración `production`.

## Arquitectura

```
src/app/
├── core/                     # una sola vez en toda la app (CoreModule)
│   ├── models/               # tipos alineados con el contrato de la API
│   ├── services/             # auth, tickets, users
│   ├── guards/               # auth, role, guest
│   ├── interceptors/         # Bearer + renovación de token
│   └── permissions/          # reglas de rol reutilizables
├── shared/                   # pipes de etiquetas/badges y página 403
├── layout/                   # shell con sidebar y navbar
└── features/                 # auth, dashboard, tickets, users (lazy loading)
```

Cada área de `features/` se carga de forma diferida desde
`app-routing.module.ts`. Las rutas privadas cuelgan de un mismo shell
(`DashboardLayoutComponent`) protegido por `authGuard`, para que la barra
lateral no se vuelva a montar al cambiar de sección.

### Valores del dominio

Los estados, prioridades y roles se guardan **tal como los devuelve la API**
(`open`, `in_progress`, `low`, `urgent`, `admin`, `agent`, `client`). La
traducción al español ocurre sólo en la vista, con los pipes de
`shared/pipes/ticket-label.pipe.ts`.

### Permisos por rol

| Acción | Cliente | Agente | Administrador |
| --- | --- | --- | --- |
| Ver tickets | Los suyos | Los asignados + los libres | Todos |
| Crear ticket | Sí | No | Sí |
| Actualizar ticket | No | Prioridad y estado, sólo en los suyos | Todos los campos |
| Asignar / eliminar | No | No | Sí |
| Comentar | Sí (salvo ticket cerrado) | Sí (salvo ticket cerrado) | Sí (salvo ticket cerrado) |
| Gestionar usuarios | No | No | Sí |

Estas reglas viven en `core/permissions/ticket-permissions.ts` y deciden qué
muestra la interfaz. **No son un control de seguridad**: el backend las vuelve a
validar y responde `403` si el rol no corresponde.

## Preguntas de sustentación

**¿Por qué existen dos tokens?**
El *access token* dura 15 minutos y viaja en cada petición; si alguien lo roba,
la ventana de daño es corta. El *refresh token* dura 7 días, sólo se envía al
endpoint de renovación y puede revocarse en el servidor. Así se consigue a la
vez sesiones largas y credenciales de vida corta.

**¿Dónde almacenar los tokens y por qué?**
Aquí se usa `localStorage` porque la API los entrega en el cuerpo de la
respuesta y la sesión debe sobrevivir a un refresco de página. La opción más
segura sería una cookie `httpOnly`, inaccesible a JavaScript y por tanto inmune
a XSS, pero eso exige que el backend la emita. Con `localStorage` cualquier
script inyectado puede leer los tokens: es una decisión de compromiso, no la
más segura.

**¿Cómo determina el guard si existe una sesión válida?**
`authGuard` comprueba que el `AuthService` tenga access token y usuario en su
estado (rehidratado de `localStorage` al arrancar). No valida la firma ni la
expiración: de eso se encarga la API con un `401`, que el interceptor convierte
en una renovación. El guard evita la navegación inútil; la autoridad real es el
servidor.

**¿Qué ocurre cuando varias peticiones reciben 401 simultáneamente?**
Sin coordinación cada una pediría su propio refresh y, como la API **rota** el
refresh token, la primera invalidaría el de las demás y la sesión se caería. El
interceptor usa un candado (`isRefreshing`) y un `BehaviorSubject`: la primera
petición renueva y las demás se suspenden sobre el subject hasta que éste emite
el token nuevo, momento en que se reintentan. Comprobado en el panel, que lanza
cinco peticiones a la vez: cinco `401` → **un** `POST /auth/refresh` → cinco
reintentos con `200`.

**¿Cuál es la diferencia entre 401 y 403?**
`401 Unauthorized` significa "no sé quién eres": falta el token, está mal
formado o expiró. La respuesta es renovar el token o volver al login.
`403 Forbidden` significa "sé quién eres y no puedes": la sesión es válida pero
el rol no alcanza. Por eso `roleGuard` lleva a `/unauthorized` y no al login:
volver a iniciar sesión no cambiaría nada.

**¿Cómo restringir funcionalidades según el rol sin depender únicamente de la
interfaz?**
Ocultar un botón sólo evita clics accidentales; quien abra la consola o escriba
la URL a mano se lo salta. El control real es del servidor, que valida el rol en
cada endpoint. En el frontend se ocultan las acciones (comodidad), se cortan las
rutas con `roleGuard` (defensa en profundidad) y se muestra el mensaje de error
que devuelve la API cuando aun así responde `403`.

## Limitaciones conocidas

- **Nombres de usuario.** Los tickets traen sólo IDs (`u_client1`) y
  `GET /api/users` está reservado al admin. Por eso el administrador ve nombres
  y los demás roles ven etiquetas genéricas ("Asignado a un agente").
- **Bandeja del agente.** La API no acepta un filtro `assignedTo`, así que el
  selector "Asignados a mí / Sin asignar" filtra la página ya descargada, no el
  conjunto completo. La interfaz lo advierte.
- **Métricas del panel.** No existe endpoint de métricas: los totales se derivan
  de `GET /api/tickets` consultando cada estado con `limit=1` y leyendo
  `meta.total`.
