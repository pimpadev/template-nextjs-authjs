import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import NextAuth from "next-auth";
import { prisma } from "./lib/prisma";
import { LoginSchema } from "./schemas";
import Google from "next-auth/providers/google";
import { sendEmailVerification } from "./lib/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { data, success } = LoginSchema.safeParse(credentials);
        if (!success) throw new Error("Invalid credentials");

        const user = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
        });
        if (!user || !user.password) throw new Error("Invalid credentials");

        const isPasswordCorrect = await bcrypt.compare(
          data.password,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Invalid credentials");

        if (!user.emailVerified) {
          const verifyTokenExists = await prisma.verificationToken.findFirst({
            where: {
              identifier: user.email,
            },
          });

          if (verifyTokenExists?.identifier) {
            await prisma.verificationToken.delete({
              where: {
                identifier: user.email,
              },
            });
          }

          const token = nanoid();

          await prisma.verificationToken.create({
            data: {
              identifier: user.email,
              token,
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
          });

          await sendEmailVerification(user.email, token);

          throw new Error("Please check your email for the verification link");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    // jwt() is executed every time a JWT is created or updated
    // Here you can add additional information to the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    // session() is used to add the token information to the user's session
    // This allows it to be available in the client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.roles = token.roles;
      }
      return session;
    },
  },
  events: {
    // This event happens when a new account (from providers like Google, Facebook, etc) is bound to an existing user at the database.
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
});
