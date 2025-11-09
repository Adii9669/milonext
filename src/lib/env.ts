import zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().nonempty(),
  Google_Client_id: zod.string().nonempty(),
  Google_secret: zod.string().nonempty(),
  NEXTAUTH_SECRET: zod.string().nonempty(),
  NEXTAUTH_URL: zod.string().nonempty(),
  NEXTAUTH_CLIENT_ID: zod.string().nonempty(),
});


const clientSchema = zod.object({
  NEXT_PUBLIC_API_URL: zod.string().url(),
});

export const clientEnv = clientSchema.parse(process.env);
export const env = envSchema.parse(process.env);
