# Nextjs with AuthJS Template
<div align="right">
  
  [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F314ZLPT)
</div>

## Getting Started

### Env variables

The first thing to do is to fill in the environment variables. You must make a copy of the `.env.example` file (creating an `.env` file) and fill it with all the variables present there.

### Running the project

First we will want to start a database since every user that registers on the platform will persist. To do this, we run the following command to raise a database that will serve us for development:

```zsh
docker compose up -d
```

Then we can run the development server:

```zsh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## AuthJS

To learn more about AuthJS, take a look at the following resources:

- [AuthJS Documentation](https://authjs.dev/getting-started/installation?framework=next.js)

To test the behaviour, these are the available urls by default:

- Sign In: http://localhost:3000/api/auth/signin
- Sign Out: http://localhost:3000/api/auth/signout

## Prisma

The first command generates Prisma Client, which is an auto-generated database client library specific to your database schema. Prisma Client provides type-safe database access and is used to perform database operations in your application code.

```zsh
npx prisma generate
```

<ins>When to use it:</ins>

- After modifying the schema.prisma file.
- When you need to regenerate the Prisma client to reflect changes in your schema.
- You need to run it every time you change your model in schema to make sure the Prisma client is up to date with the latest database structure.

---

The second will generate migrations and apply them to make the database in sync with the Prisma schema.

Migrations are a way to keep your database schema in sync with your application's codebase. When you make changes to your database schema, you create a migration to apply those changes to the database. The dev command applies any pending migrations in development mode.

```zsh
npx prisma migrate dev
```

<ins>When to use it:</ins>

- After making changes to your schema (schema.prism) that affect the database structure.
- When you are developing and need to apply these changes to your local or development database.

---

This command applies all pending migrations to your database in the current environment. Unlike `npx prisma db push`, which simply synchronizes the database with the schema without creating a change history, `npx prisma migrate deploy` ensures that previously generated and versioned migrations are executed in the correct order. This is especially useful in production environments, where you need to keep a tight control over changes in the database structure.

```zsh
npx prisma migrate deploy
```

<ins>When to use it:</ins>

- Use a CI system (e.g. GitHub Actions) to sync your Prisma schema and migration history with your preview database using prisma migrate deploy.

- In production or staging environments: When you want to apply database structural changes that have been tested and approved during development.

- To maintain a change history: Ensure that each change to the database structure is recorded as a migration, allowing a clear trace of when and how the modifications were made.

- When you want to ensure consistency: Apply migrations in the exact order they were created, which is crucial to avoid synchronization problems between the database schema and your code.

---

This command synchronizes your database with the Prisma schema without generating or applying migrations. It is useful to update the database structure quickly during development without having to handle migrations.

```zsh
npx prisma db push
```

<ins>When to use it:</ins>

- When you want to reflect quick database changes without creating migrations.
- Ideal for prototyping or during the early stages of development, when you do not need a migration history.
- Note: This command does not generate a migration history, so it is not ideal for production environments.

---

This command introspects the existing database and updates your `schema.prisma` file to reflect the current database structure. It is useful when you work with an existing database and want to generate the Prism schema from it.

```zsh
npx prisma db pull
```

<ins>When to use it:</ins>

- When you have an existing database and want to generate the Prisma schema from its current structure.
- Useful if other changes have been made directly to the database and you need to reflect these changes in your `schema.prisma` file.

## Resend

[Resend](https://resend.com/home) is an API platform focused on facilitating the sending of transactional and marketing emails. It stands out for offering a modern and easy-to-integrate infrastructure for developers, allowing them to send emails directly from their applications with ease.

We will use it to manage the sending of emails to verify accounts and to reset passwords.

Is important to define two environment variables:

- `NEXTAUTH_URL`: The base url of your application.
- `AUTH_RESEND_KEY`: The API key for your Resend account.

Additionally there is an associated TODO in your API endpoint (for example, /verify-email). It can be used to redirect to a particular page alluding to the verification performed. This way you can set up concrete behaviors.
