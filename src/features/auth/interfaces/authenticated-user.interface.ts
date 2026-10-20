/** Usuario autenticado con un token JWT, tal como queda en `request.user`. */
export interface AuthenticatedUser {
  userId: number;
  username: string;
}
