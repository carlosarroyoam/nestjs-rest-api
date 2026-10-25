import type { Request } from 'express';

import { User } from '@/users/entities/user.entity';

/** Petición HTTP que pasó por `LocalAuthGuard`, con el usuario en `user`. */
export type AuthenticatedRequest = Request & { user: User };
