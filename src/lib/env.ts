function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} en apps/hogar-finanzas.`);
  }
  return value;
}

export function getPublicAppEnv() {
  return {
    databaseUrl: required("PUBLIC_APP_DATABASE_URL"),
    directUrl: required("PUBLIC_APP_DIRECT_URL"),
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function assertPublicAppEnv() {
  return getPublicAppEnv();
}
