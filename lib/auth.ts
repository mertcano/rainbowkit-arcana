import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { SiweMessage } from "siwe";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret?.trim()) {
  throw new Error("NEXTAUTH_SECRET must be configured");
}

const configuredUrl = process.env.NEXTAUTH_URL;
if (!configuredUrl?.trim()) {
  throw new Error("NEXTAUTH_URL must be configured");
}

let authUrl: URL;
try {
  authUrl = new URL(configuredUrl);
} catch {
  throw new Error("NEXTAUTH_URL must be a valid URL");
}
if (
  !["http:", "https:"].includes(authUrl.protocol) ||
  authUrl.username ||
  authUrl.password
) {
  throw new Error("NEXTAUTH_URL must be an HTTP(S) URL without credentials");
}

const useSecureCookies = authUrl.protocol === "https:";
const csrfCookieName = useSecureCookies
  ? "__Host-next-auth.csrf-token"
  : "next-auth.csrf-token";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret,
  useSecureCookies,
  callbacks: {
    async session({ session, token }) {
      if (typeof token.sub !== "string" || !token.sub.trim()) {
        throw new Error("Session subject is missing");
      }
      session.id = token.sub;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        if (!credentials?.message?.trim() || !credentials.signature?.trim()) {
          return null;
        }

        try {
          const nonce = cookies().get(csrfCookieName)?.value.split("|")[0];
          if (!nonce?.trim()) {
            return null;
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message));
          if (siwe.domain !== authUrl.host || siwe.uri !== authUrl.origin) {
            return null;
          }

          const result = await siwe.verify({
            signature: credentials.signature,
            domain: authUrl.host,
            nonce,
          });

          return result.success ? { id: result.data.address } : null;
        } catch {
          return null;
        }
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
