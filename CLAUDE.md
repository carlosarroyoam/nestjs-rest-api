# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev        # run with watch mode (http://localhost:3000, Swagger at /docs)
npm run build            # nest build -> dist/
npm run lint             # eslint with --fix (type-checked rules + prettier)
npm run format           # prettier on src/ and test/

npm test                                   # unit tests (vitest, src/**/*.spec.ts)
npx vitest run src/auth/auth.service.spec.ts   # single test file
npx vitest run -t "<test name>"            # tests whose name matches
npm run test:cov                           # coverage (v8) -> coverage/
npm run test:e2e                           # test/**/*.e2e-spec.ts — boots the full AppModule, needs a live MySQL
```

Tests run through Vitest with `unplugin-swc` (needed for decorator metadata); `describe`/`it`/`vi` are globals.

## Setup

- Copy `.example.env` to `.env`. All DB, JWT, refresh-token and bcrypt settings are read with `ConfigService.getOrThrow`, so a missing variable fails at startup.
- MySQL schema and seed data live in `database/schema.sql` and `database/seed.sql`. TypeORM runs with `synchronize: false`: **schema changes must be made by hand in `schema.sql`** and kept in sync with the entities.
- A Postman collection is kept in `docs/postman/postman_collection.json`; update it when endpoints change.
- The port is hardcoded to 3000 in `src/main.ts` (`APP_PORT` in `.env` is currently unused). CORS allows only `http://localhost:4200`.

## Architecture

NestJS 12 + TypeORM (MySQL) + Passport. Imports use the `@/` alias for `src/` (configured in `tsconfig.json` and both vitest configs).

- **`main.ts`** — global prefix `/api/v1` (except `GET /`), helmet, compression, Swagger, and a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted` and `transform` (so `@Param('userId') userId: number` is converted automatically). Validation errors are flattened into `{ message: 'Validation Error', errors: [{ property, message }] }` with dotted paths for nested properties.
- **`core/`** — `GlobalExceptionFilter` (registered via `APP_FILTER`) turns every exception into an RFC 9457 `application/problem+json` response. `HttpException`s and exposed 4xx `http-errors` (e.g. body-parser) keep their message; anything else becomes a sanitized 500 and is logged with its stack. A `BadRequestException` body's `errors` field is passed through to the problem response.
- **`auth/`** — `LocalStrategy` + `LocalAuthGuard` for `POST /auth/login`; `JwtStrategy` + `JwtAuthGuard` for protected routes. The JWT payload is `{ sub, username, role }`, exposed to handlers as `AuthenticatedUser` (`userId`, `username`, `role`) through the `@CurrentUser()` decorator.
  - Refresh tokens are opaque random strings; only their SHA-256 hash is stored (`refresh_tokens`). There is one token per `(user, deviceId)` — logging in again from the same device replaces it. `refresh-token` rotates the token with a conditional update on the old hash to prevent concurrent double-rotation, and requires the same `deviceId`.
  - Bad credentials and inactive accounts return **403** (`ForbiddenException`), not 401; invalid/expired refresh tokens return 401.
- **`users/`** — CRUD at `/users`, all behind `JwtAuthGuard`. New users are created inactive; `DELETE` is a soft delete (`isActive = false`). Only the user themself or the `Admin` role (`ADMIN_ROLE`) may `PATCH` a user. Services return DTOs built with `plainToInstance(..., { excludeExtraneousValues: true })`, so response DTO fields need `@Expose()`.
- `users.is_active` is a MySQL `BIT(1)` column mapped to `boolean` through `BoolBitTransformer`.
- Timestamps (`createdAt`, `updatedAt`, `lastUsedAt`) are set explicitly in the services rather than relying on DB defaults.

Unit tests build a `Test.createTestingModule` with mocked repositories (`getRepositoryToken(Entity)`), `JwtService` and `ConfigService`.

## Conventions

- Code comments, JSDoc and commit messages are written in **Spanish**. Commit subjects use the third-person present ("Agrega…", "Renombra…", "Limpia…").
- JSDoc: a single summary sentence plus `@param`/`@returns`/`@throws` tags — no extra explanatory paragraphs.
- ESLint requires explicit function return types (`@typescript-eslint/explicit-function-return-type`). Prettier uses single quotes and trailing commas.
