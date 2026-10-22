-- Nestjs User Service MySQL Schema

CREATE DATABASE IF NOT EXISTS `nest-user-service`;

USE `nest-user-service`;

CREATE TABLE IF NOT EXISTS roles (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL,
  description VARCHAR(128) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL,
  username VARCHAR(128) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  age TINYINT DEFAULT NULL,
  is_active BIT(1) NOT NULL,
  role_id INT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_username (username),
  KEY fk_users_role_id (role_id),
  CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
