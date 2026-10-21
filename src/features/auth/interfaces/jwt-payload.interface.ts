/** Contenido del token JWT: `sub` es el id del usuario y `role` su rol. */
export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}
