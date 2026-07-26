-- User Service Seed Data

USE `user-service`;

INSERT INTO `roles` (id, type, description) VALUES
(1, 'Admin', 'Role for admins users'),
(2, 'User', 'Role for normal users');

INSERT INTO `users` (id, name, email, username, password_hash, age, is_active, role_id, created_at, updated_at) VALUES
(1, 'Carlos Arroyo Martínez','carroyom@mail.com', 'carroyom', '$2a$10$dFOrlb745A5rIS8HV/EOV.vUOLRIiKVe1k.codwA8XUBOAolcTA0a', 31, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Cathy Stefania Guido Rojas','cguidor@mail.com', 'cguidor', '$2a$10$dFOrlb745A5rIS8HV/EOV.vUOLRIiKVe1k.codwA8XUBOAolcTA0a', 31, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
