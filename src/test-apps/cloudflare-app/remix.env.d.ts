/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  API_URL: string;
  CONTENT: KVNamespace;
  POST_API_KEY: string;
}
