/** Contenido del token JWT: `sub` es el id del usuario. */
export interface JwtPayload {
  sub: number;
  username: string;
}
