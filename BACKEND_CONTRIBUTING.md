# 🧠 NestJS + TypeScript Backend Best Practices (2025 Edition)

> A guide for building clean, maintainable, testable, and scalable NestJS backends using TypeScript. Follows SOLID principles, DDD-inspired architecture, and real-world production tips.

---

## 📦 Project Structure

Organize code by **domain feature**, not technical layer. Follow modular boundaries for clean encapsulation:

```
src/
├── users/
│   ├── dto/                  # Data Transfer Objects for validation and input
│   ├── entities/             # ORM models/entities
│   ├── interfaces/           # Contracts for services, repositories, etc.
│   ├── users.controller.ts   # HTTP handlers (API endpoints)
│   ├── users.service.ts      # Business logic
│   ├── users.repository.ts   # Data access abstraction
│   └── users.module.ts       # NestJS DI config and module boundaries
├── common/
│   ├── interceptors/         # Global and scoped interceptors (e.g., logger)
│   ├── guards/               # Auth and permissions guards
│   ├── filters/              # Exception filters
│   ├── middleware/           # Express-style middleware
│   └── decorators/           # Custom decorators for reusability
```

### Guidelines

- **Modular by feature**: Enables isolation, reusability, and scalability.
- **Shared folder (`common/`)**: Centralize generic utilities, guards, etc.
- **Keep files small**: Split any file > 300 LOC for readability.
- **Avoid circular dependencies**: Break into shared submodules or extract interfaces.

---

## 🧠 SOLID Principles in NestJS

### S – Single Responsibility Principle (SRP)

Each class or file should do one thing:

- **Controllers**: Route and delegate to services
- **Services**: Implement business logic
- **Repositories**: Handle database queries only

Avoid mixing concerns (e.g., no DB logic inside services).

### O – Open/Closed Principle (OCP)

Code should be open to extension but closed to modification:

- Use `abstract` classes or `interfaces`
- Compose behavior with decorators, strategies, or feature modules
- Example: Add a new payment provider by extending `IPaymentStrategy`

### L – Liskov Substitution Principle (LSP)

Subtypes must be swappable without breaking the system:

- Create interfaces like `IUserService`
- Mock these in tests or swap implementation in different environments

### I – Interface Segregation Principle (ISP)

Use multiple small interfaces:

- Avoid large interfaces like `IUserService`
- Split into `IUserFinder`, `IUserUpdater`, etc., if concerns are different

### D – Dependency Inversion Principle (DIP)

Depend on abstractions, not implementations:

- Inject services via `@Inject()` and tokens/interfaces
- Register in module providers with tokens for flexibility

---

## ✅ TypeScript Best Practices

- **`strict` mode**: Forces safer coding practices
- **Avoid `any`/`unknown`**: Use precise types or `unknown` with type guards
- **Use `readonly`**: For immutability in DTOs and models
- **Prefer `enum` or `as const`**: Enforces value constraints
- **Use utility types**: `Pick`, `Partial`, `Omit` to reuse and compose types
- **Use `Record<K, V>` and mapped types**: For dynamic typing patterns

---

## 📥 DTOs and Validation

- Keep all request DTOs in a dedicated `dto/` folder
- Use `class-validator` + `class-transformer`
- Decorate with validations: `@IsEmail`, `@IsString`, etc.
- Enable global or scoped pipes:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
```

Benefits:

- Automatic validation
- Sanitizes input
- Type-safe request body mapping

---

## 🗂️ Repositories & Persistence

- Encapsulate DB logic in repositories
- Use `Prisma`, `TypeORM`, or `MikroORM`
- Use interface contracts for all repos to enable swapping DB engines

Benefits:

- Easy mocking
- Loosely coupled persistence logic
- Better separation of concerns

---

## 🧩 Testing Strategy

- **Unit tests**: Test services in isolation with mocked dependencies
- **Integration tests**: Test modules (e.g., user + DB) in memory or test DB
- **E2E tests**: Use `supertest` to test full app via HTTP

Best Practices:

- Close to implementation: use `*.spec.ts`
- Use `jest-mock`, `ts-mockito`, or custom fakes
- Seed known data via factories

---

## 🔐 Security & Configuration

- Use `@nestjs/config` with validation schemas (Joi/zod)
- Never use `process.env` directly
- Load secrets from vaults (AWS/GCP/Azure/Kubernetes)
- Use `Guards` for authentication and authorization

Security Tips:

- Hash passwords with `bcrypt`
- Enable helmet for HTTP security
- Sanitize user input
- Log auth failures and rate-limit logins

---

## 🌟 Controller Best Practices

- Only map HTTP -> service
- Use proper HTTP verbs: `GET`, `POST`, `PATCH`, `DELETE`
- Use `@ApiTags`, `@ApiOperation`, `@ApiResponse` for docs

```ts
@ApiTags('Users')
@Controller('users')
export class UsersController {}
```

---

## 🤀 Async & Performance

- Always `await` async calls
- Avoid `.then().catch()` chains
- Use `Promise.all` for concurrent async ops
- Profile bottlenecks (e.g., long DB queries)
- Use `async-hooks`, interceptors, or datadog/newrelic

---

## 🪧 Middleware, Guards, Interceptors

- **Middleware**: Access request before route handler (e.g., add headers, request ID)
- **Guards**: Used for access control (e.g., role-based, auth checks)
- **Interceptors**: Format responses, handle logging, metrics, caching

Advanced Use:

- Interceptors can wrap observables
- Combine `Guards + Interceptors` for auth logging

---

## 🔍 Error Handling

- Use built-in NestJS exceptions (`BadRequestException`, `UnauthorizedException`, etc.)
- Create domain-specific custom exceptions
- Avoid `try/catch` unless external code is involved
- Add global exception filter for consistent error responses

Example:

```ts
throw new NotFoundException('User not found')
```

---

## 📊 Observability & Monitoring

- Use interceptors to log duration and metadata
- Add tracing (`OpenTelemetry`, `Datadog`, `AWS X-Ray`)
- Log with `pino` or `winston`
- Monitor metrics via Prometheus + Grafana
- Integrate Sentry for stack traces

---

## 📜 API Documentation

- Use `@nestjs/swagger`
- Document every DTO with `@ApiProperty`
- Customize with `@ApiResponse`, `@ApiQuery`, etc.

Tips:

- Generate `openapi.json` in CI/CD
- Use Swagger UI for QA/internal devs

---

## 📊 Dependency Injection

- Use `@Injectable()` for all services/providers
- Use interfaces + tokens to decouple implementations
- Avoid direct `new` calls — let Nest resolve all dependencies

Advanced:

- Use factory providers to inject config-based logic

```ts
providers: [{ provide: IUserRepo, useClass: PrismaUsersRepository }]
```

---

## 📌 Naming Conventions

| Element    | Convention        | Example         |
| ---------- | ----------------- | --------------- |
| DTO        | PascalCaseDto     | CreateUserDto   |
| Interface  | IPascalCase       | IUserService    |
| Entity     | PascalCase        | User, Vault     |
| Service    | PascalCaseService | UsersService    |
| Module     | PascalCaseModule  | UsersModule     |
| Repository | PascalCaseRepo    | UsersRepository |

Use clear, consistent naming to reduce confusion and improve team collaboration.

---

## 📚 Recommended Tools & Libraries

| Purpose         | Tool                       |
| --------------- | -------------------------- |
| Env management  | `@nestjs/config`, `dotenv` |
| DTO validation  | `class-validator`, `zod`   |
| Docs            | `@nestjs/swagger`          |
| Testing         | `jest`, `supertest`        |
| Logging         | `winston`, `pino`          |
| ORM             | `Prisma`, `TypeORM`        |
| Background Jobs | `BullMQ`, `Agenda`         |
| Metrics         | `Prometheus`, `Grafana`    |
| Tracing         | `OpenTelemetry`, `Datadog` |
| Errors          | `Sentry`, `LogRocket`      |

---

## ✨ Final Tips

- Enforce code quality: `ESLint`, `Prettier`, `Husky`
- Add type checks + lint in CI
- Prefer declarative config over imperative code
- Use ADR (Architecture Decision Records)
- Avoid premature optimization
- Prioritize developer experience and long-term maintainability
