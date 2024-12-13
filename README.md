# IMPLEMENTACIÓN DE UN CHATBOT CON LA TECNOLOGÍA DIALOG FLOW  IA PARA LA ATENCIÓN DE  CLIENTES  EN LA EMPRESA “GIGA & MEGA PLUS TV S.A.C

Este proyecto es una aplicación web desarrollada con Node.js, MySQL, JavaScript y Dialogflow. Permite gestionar usuarios, autenticar sesiones y ofrecer servicios de manera interactiva a través de un chatbot.

## Descripción

Este sistema permite a los usuarios registrarse, iniciar sesión y acceder a un menú de servicios. Utiliza sesiones para gestionar el estado de los usuarios autenticados y emplea Dialogflow para interactuar con los usuarios a través de un chatbot.

## Tecnologías utilizadas

- **Node.js**: Plataforma para ejecutar JavaScript en el servidor.
- **MySQL**: Base de datos relacional para almacenar la información de los usuarios y servicios.
- **Express.js**: Framework para facilitar la creación de la API y el servidor web.
- **Dialogflow**: Para integración de chatbots inteligentes.
- **EJS**: Motor de plantillas para renderizar las vistas en el servidor.
- **express-session**: Middleware para manejar sesiones de usuario.
- **dotenv**: Para manejar variables de entorno y configurar de manera segura los detalles de conexión y otras configuraciones.
- **Body-parser**: Middleware para procesar los datos de las solicitudes HTTP.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes requisitos:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [Dialogflow Account](https://dialogflow.cloud.google.com/)
- [Postman](https://www.postman.com/) (Opcional para pruebas de API)

## Instalación

1. Clona este repositorio en tu máquina local:

    ```bash
    git clone https://github.com/tuusuario/tu-repositorio.git
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd tu-repositorio
    ```

3. Instala las dependencias de Node.js:

    ```bash
    npm install
    ```

4. Crea un archivo `.env` en el directorio raíz del proyecto y agrega tus variables de entorno:

    ```bash
    SESSION_SECRET=tu-secreto-de-sesion
    DB_HOST=localhost
    DB_USER=tu-usuario-de-base-de-datos
    DB_PASSWORD=tu-contraseña
    DB_NAME=nombre-de-tu-base-de-datos
    ```

5. Configura MySQL para que se conecte con el proyecto. Asegúrate de crear las tablas necesarias en tu base de datos.

6. Inicia el servidor:

    ```bash
    npm start
    ```

7. Abre tu navegador y accede a:

    ```
    http://localhost:3000
    ```

## Estructura del Proyecto

- **`/public`**: Archivos estáticos como imágenes, estilos CSS y scripts JS.
- **`/views`**: Archivos de plantillas EJS para las vistas.
- **`/routes`**: Rutas del servidor, como `crearUsuario.js` y `servicios.js`.
- **`/private`**: Archivos y configuraciones sensibles (asegúrate de proteger esta carpeta).
- **`/private/db.js`**: Configuración de conexión a MySQL.
- **`/controllers`**: Lógica de controladores para interactuar con la base de datos y manejar solicitudes.

## Funcionalidades

### Autenticación

- **Inicio de sesión**: Los usuarios pueden iniciar sesión con sus credenciales.
- **Manejo de sesiones**: Las sesiones se gestionan para mantener a los usuarios autenticados durante su navegación.

### Base de Datos

- La base de datos se utiliza para almacenar información de usuarios, credenciales y servicios.
- Las consultas se realizan mediante MySQL utilizando el módulo `mysql` de Node.js.

### Chatbot (Dialogflow)

- El proyecto está integrado con Dialogflow, lo que permite la creación de un chatbot que interactúa con los usuarios.
- Puedes configurar nuevos intents en Dialogflow para personalizar las respuestas del chatbot.

### Rutas

- **`/login1`**: Ruta para procesar el inicio de sesión de los usuarios.
- **`/home`**: Ruta de bienvenida después del inicio de sesión.
- **`/menu`**: Ruta que muestra el menú de servicios al usuario autenticado.

## Configuración de Dialogflow

1. Crea un agente en [Dialogflow](https://dialogflow.cloud.google.com/).
2. Configura intents que se corresponden con las preguntas o interacciones que quieres que el chatbot maneje.
3. Conecta Dialogflow a tu aplicación Node.js utilizando las credenciales de la API.

## Contribución

1. Haz un fork del proyecto.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit de los mismos (`git commit -am 'Agrega nueva funcionalidad'`).
4. Sube tus cambios a tu fork (`git push origin feature/nueva-funcionalidad`).
5. Crea un Pull Request para que los cambios sean revisados e integrados.

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

## Contacto

Si tienes preguntas o sugerencias, no dudes en contactarme.

---

¡Gracias por usar este proyecto! Disfruta construyendo tu aplicación web con Node.js, MySQL y Dialogflow.







