# Semantic Integration Dashboard

Portal administrativo Frontend desarrollado en Next.js para la visualización, mapeo y gestión de integración de esquemas XML (XSD). Esta interfaz actúa como el cliente principal para el motor de orquestación de datos, permitiendo a los operadores homologar estructuras complejas mediante una UI intuitiva y segura.

## Características Principales

* **Mapeo Visual de Esquemas:** Implementación de componentes recursivos (`TreeView.js`, `MapingModal.js`) para la navegación y vinculación gráfica de nodos XML anidados.
* **Seguridad y Control de Acceso (Middleware):** Protección de rutas a nivel de servidor utilizando el Middleware de Next.js (`middleware.ts`), garantizando que solo las sesiones con tokens JWT válidos puedan acceder a las vistas protegidas (`/MainView`, `/EsquemasConf`).
* **Gestión de Estado Desacoplada:** Lógica de negocio extraída de la capa de presentación mediante el uso extensivo de Custom Hooks (`useAuth.js`, `useUserData.js`, `useElementSelection.js`), mejorando la testeabilidad y la escalabilidad del código.
* **Arquitectura de Componentes:** Sistema de diseño modular y reutilizable, con tablas de datos dinámicas (`ElementsTable.js`, `UserDataTable.js`) y paneles de seguimiento de cambios (`ChangesPanel.js`).

## Stack Tecnológico

* **Framework Core:** Next.js (App Router).
* **Librería UI:** React 18+.
* **Estilización:** Integración de Tailwind CSS con hojas de estilo en cascada complementarias (`globals.css`, `login.css`).
* **Conexión API:** Fetch nativo integrado en servicios dedicados (`Functions.js`).

## Configuración y Despliegue Local

Para levantar este entorno en sincronía con el backend:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/AxelLaraG/data-integration-dashboard
   cd semantic-integration-dashboard
   ```
2. **Instalar Dependencias:**
    ```bash
    npm install
    ```
3. **Variables de Entorno:**
    Genera un archivo `.env.local` en la raíz del proyecto. Deberás configurar la URL base que apunta a la instancia de la API de FastAPI:
    ```bash
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```
4. **Ejecución del servidor:**
    ```bash
    npm run dev
    ```

## Estructura del proyecto
El código está organizado siguiendo un paradigma de escalabilidad horizontal:

- `/src/app`: Definición estricta de rutas (/EsquemasConf, /MainView) y layouts globales.

- `/src/components`: Vistas atómicas y moleculares separadas por dominio de negocio (UI genérica vs. Componentes complejos).

- `/src/hooks`: Abstracción de toda la lógica de reactividad, manejo de side-effects y llamadas de red.

- `/src/middleware.ts`: Interceptor edge-runtime para evaluar los tokens de las cookies antes de resolver las peticiones de navegación.
