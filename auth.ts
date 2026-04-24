import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connect from "./lib/db/mongodb";
import Customer from "./models/Customer";
import { comparePassword } from "./lib/server/utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        contact_number: {},
        password: {},
      },
      async authorize(credentials) {
        const { contact_number, password } = credentials as {
          contact_number: string;
          password: string;
        };
        await connect();
        try {
          const customer = await Customer.findOne({
            contact_number: contact_number,
          }).lean();
          if (customer) {
            const isPasswordCorrect = await comparePassword(
              password,
              customer.password,
            );
            if (isPasswordCorrect) {
              if (!customer.is_verify) {
                const now = Date.now();
                if (
                  customer.otp_send_blocked_until &&
                  customer.otp_send_blocked_until.getTime() > now
                ) {
                  throw new Error("TOO_MANY_ATTEMPTS");
                }

                throw new Error("CUSTOMER_NOT_VERIFY");
              }

              return {
                id: customer._id.toString(),
                name: customer.name,
                contact_number: customer.contact_number,
              };
            }
          }

          throw new Error("INVALID_CREDENTIALS");
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }

          throw new Error("SERVER_ERROR");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
});
