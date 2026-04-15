# Econocom Frontend

Aplicación frontend desarrollada en **Angular 16** como parte de la prueba técnica para Econocom. Este proyecto implementa una interfaz de usuario moderna, modular y con buenas prácticas de desarrollo para gestionar los flujos de autenticación de usuarios.

## 🚀 Tecnologías y Herramientas

- **Framework**: [Angular 16](https://angular.io/) (utilizando *Standalone Components* para una mejor modularidad y rendimiendo).
- **Estilos y UI**: [Angular Material](https://material.angular.io/) y SCSS (Sass) nativo.
- **Programación Reactiva**: [RxJS](https://rxjs.dev/).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/).
- **Rutas y Guardas**: `RouterModule` y validación de autenticación.

## 🌟 Características Implementadas

La aplicación se centra en un módulo robusto de autenticación o `AuthService`, ofreciendo las siguientes características:

1. **Inicio de Sesión (Login Clásico)**: Interfaz intuitiva validando credenciales (email y contraseña).
2. **Registro de Usuarios (Sign Up)**: Ventana modal de alta de usuario manejada limpiamente con Angular Material Dialog.
3. **Inicio de Sesión con SSO (Single Sign-On)**: Integración con proveedores externos mediante redirección y validación de callbacks transparentes y manejados bajo una arquitectura limpia en la capa del componente.
4. **Gestión de Sesión (Tokens y Refresco Automático)**: 
   - Se emplea un interceptor HTTP en Angular en su versión funcional (`HttpInterceptorFn`).
   - El sistema inyecta tokens JWT mediante la cabecera `Authorization` de todas las peticiones a rutas protegidas.
   - En caso de expirar el token de acceso principal (HTTP 401), se intercepta el error, se renueva la sesión mediante el uso del `refresh_token` sin intervención del usuario y se reintenta automáticamente la petición fallida (Patrón *Refresh Token Rotation*).
5. **Arquitectura Limpia**: Separación de responsabilidades:
   - *Core*: Para servicios transversales como la autenticación puramente (ver `AuthService`) e interceptores.
   - *Features*: Donde la funcionalidad está contenida (Componentes, servicios de interfaz, páginas como `LoginPageComponent`).
6. **Diseño Visual**: Aplicación reactiva y notificaciones *toast/snackbars* retroalimentando al usuario ante eventos de error o éxito. Todos los componentes de formulario y utilidades de Angular Material.

## 📂 Estructura del Proyecto

```text
src/
└── app/
    ├── core/                   # Módulos globales de un solo uso
    │   ├── auth/               # Gestión de Estado Auth y Tokens (auth.service, auth.interceptor)
    │   └── models/             # Interfaces TypeScript compartidas
    └── features/               # Módulos funcionales divididos por dominio
        └── login/              # Feature de Inicio de Sesión
            ├── components/     # Dumb Components o visuales (banner, form, modal)
            ├── pages/          # Smart Components, orquestadores (LoginPageComponent)
            └── services/       # Comunicación con el API backend de Autenticación
```

## 🛠 Instalación y Ejecución

Sigue estos pasos para desplegar el proyecto en un entorno local para el desarrollo:

### Prerrequisitos

Necesitas asegurarte de tener en tu sistema lo siguiente:
- [Node.js](https://nodejs.org/) (Versión recomendada actual LTS, idealmente >= 18.x).
- [npm](https://www.npmjs.com/) (Gestor de paquetes).

### Paso 1: Clonar y configurar dependencias

Clona el repositorio e instala las dependencias mediante NPM:

```bash
cd econocom-frontend
npm install
```

### Paso 2: Configurar Variables de Entorno

El proyecto se comunica con un backend externo. Asegúrate de configurar la URL adecuada en los entornos localizados en `src/environments/`. Por defecto, puedes revisar `environment.ts`.

### Paso 3: Arrancar el Servidor de Desarrollo

Una vez configurado y con módulos instalados, lanza el servidor local de Angular:

```bash
npm run start
# o alternativamente: ng serve
```

La aplicación se compilará y automáticamente quedará escuchando en `http://localhost:4200/`. Cualquier cambio emitirá un *hot-reload* sobre el navegador automáticamente.

### Comandos de Utilidad

- **Compilar para producción**: `npm run build`
- **Ejecutar tests unitarios (Karma/Jasmine)**: `npm run test`
- **Comprobación de Lint (ESLint)**: `npm run lint`

## 👨‍💻 Buenas Prácticas Seguidas

El repositorio se ha enriquecido con un fuerte control de las buenas metodologías a todos los niveles:
*  **JSDoc y Comentarios en Castellano**: Todas las clases, inyecciones de dependencias, interceptores e interfaces públicas exponen documentación enriquecida en línea.
*  **Separación Smart/Dumb Components**: Los componentes puramente visuales emiten eventos usando `@Output()` de vuelta al componente principal, favoreciendo que sigan el patrón *UI sin estado*.
*  **Angular Signals y `inject()`**: Empleando el modo más reciente de inicialización para servicios e inyectables en Angular v16 (`inject()` sobre el viejo constructor di-pattern).
*  **Control de Errores Silencioso**: En lugar de errores genéricos en consola, se implementa *Material Snackbars* y lógica condicional del estado HTTP para una presentación cómoda del frontend para el cliente.
