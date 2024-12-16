-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 16-12-2024 a las 17:38:30
-- Versión del servidor: 8.0.37
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cablesur_ALMACEN`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `adelanto`
--

CREATE TABLE `adelanto` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_adelanto` datetime NOT NULL,
  `tipo_documento` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cobrador` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `numero_serie` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `tipo_deuda` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `metodo` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `banco` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `forma` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cod_operacion` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cod_cuenta` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `observacion` text COLLATE utf8mb3_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chatbot_contratos`
--

CREATE TABLE `chatbot_contratos` (
  `id` int NOT NULL,
  `tipo_servicio` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `nombre_usuario` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb3_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `decos`
--

CREATE TABLE `decos` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `card_number` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `STB_id` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `nro_deco` int DEFAULT NULL,
  `apellidos` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `deudas`
--

CREATE TABLE `deudas` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `deuda` decimal(10,2) NOT NULL,
  `fecha_deuda` date NOT NULL,
  `tipo_deuda` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mes_deuda` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Disparadores `deudas`
--
DELIMITER $$
CREATE TRIGGER `prevent_delete_deudas` BEFORE DELETE ON `deudas` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar registros de la tabla deudas.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `login1`
--

CREATE TABLE `login1` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `rol` enum('admin','empleado','almacen') COLLATE utf8mb3_unicode_ci DEFAULT 'empleado',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Disparadores `login1`
--
DELIMITER $$
CREATE TRIGGER `prevent_delete_login1` BEFORE DELETE ON `login1` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar registros de la tabla login1.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_chatbot`
--

CREATE TABLE `mensajes_chatbot` (
  `id` int NOT NULL,
  `intent` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb3_unicode_ci NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo_documento` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cobrador` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `numero_serie` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `fecha_pago` datetime NOT NULL,
  `tipo_deuda` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mes_deuda` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `metodo` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `banco` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `forma` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cod_operacion` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `cod_cuenta` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `observacion` text COLLATE utf8mb3_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes_averias`
--

CREATE TABLE `reportes_averias` (
  `id` int NOT NULL,
  `servicio` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `comentario` text COLLATE utf8mb3_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb3_unicode_ci NOT NULL,
  `fecha_reporte` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `estado_cable` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `servicio` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `senal` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `tipo_servicio` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `num_decos` int DEFAULT NULL,
  `descripcion_catv` text COLLATE utf8mb3_unicode_ci,
  `estado_internet` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `tipo_servicio2` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `instalacion_int` date DEFAULT NULL,
  `velocidad` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `precio2` decimal(10,2) DEFAULT NULL,
  `tipo_onu` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `MAC` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `usuario` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `contrasena` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `ppp_name` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `ppp_password` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `nro_tarjeta` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `nro_puerto` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `descripcion_int` text COLLATE utf8mb3_unicode_ci,
  `nodo` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `total` decimal(10,2) DEFAULT '0.00',
  `activacion_cable` date DEFAULT NULL,
  `corte_cable` date DEFAULT NULL,
  `activacion_internet` date DEFAULT NULL,
  `corte_internet` date DEFAULT NULL,
  `inscripcion_cable` decimal(10,2) DEFAULT NULL,
  `inscripcion_internet` decimal(10,2) DEFAULT NULL,
  `costo_materiales_internet` decimal(10,2) DEFAULT NULL,
  `costo_materiales_cable` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Disparadores `servicios`
--
DELIMITER $$
CREATE TRIGGER `prevent_delete_servicios` BEFORE DELETE ON `servicios` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar registros de la tabla servicios.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb3_unicode_ci NOT NULL,
  `vivienda` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `nodo` varchar(50) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Disparadores `users`
--
DELIMITER $$
CREATE TRIGGER `prevent_delete_users` BEFORE DELETE ON `users` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar registros de la tabla users.';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `velocidades`
--

CREATE TABLE `velocidades` (
  `id` int NOT NULL,
  `velocidad` varchar(50) COLLATE utf8mb3_unicode_ci NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adelanto`
--
ALTER TABLE `adelanto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `chatbot_contratos`
--
ALTER TABLE `chatbot_contratos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `decos`
--
ALTER TABLE `decos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `deudas`
--
ALTER TABLE `deudas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `login1`
--
ALTER TABLE `login1`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `mensajes_chatbot`
--
ALTER TABLE `mensajes_chatbot`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `reportes_averias`
--
ALTER TABLE `reportes_averias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `direccion` (`direccion`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `velocidades`
--
ALTER TABLE `velocidades`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `adelanto`
--
ALTER TABLE `adelanto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `chatbot_contratos`
--
ALTER TABLE `chatbot_contratos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `decos`
--
ALTER TABLE `decos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `deudas`
--
ALTER TABLE `deudas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `login1`
--
ALTER TABLE `login1`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes_chatbot`
--
ALTER TABLE `mensajes_chatbot`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes_averias`
--
ALTER TABLE `reportes_averias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `velocidades`
--
ALTER TABLE `velocidades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `adelanto`
--
ALTER TABLE `adelanto`
  ADD CONSTRAINT `adelanto_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `decos`
--
ALTER TABLE `decos`
  ADD CONSTRAINT `decos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `deudas`
--
ALTER TABLE `deudas`
  ADD CONSTRAINT `deudas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
