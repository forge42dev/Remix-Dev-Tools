import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect, type LoaderFunctionArgs, defer } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Link, useFetcher,  useSubmit } from "@remix-run/react"; 
import { Button } from "../components/Button";
class Redis {
  constructor(url: string, options: any) {
    console.log("Redis constructor", url, options);
    console.error("Redis constructor", url, options);
   
  }
  on(event: string, cb: any) {
    console.log("Redis on", event, cb);
  }
  removeAllListeners(event: string) {
    console.log("Redis removeAllListeners", event);
  }
}
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
export const redis = new Redis("url", {
  commandTimeout: 5000,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 3,
});
redis.on("connect", () => console.debug("Redis connected"));
redis.on("close", () => console.debug("Redis connection closed"));
redis.on("reconnecting", () => console.log("Redis reconnecting"));
redis.removeAllListeners("error");
redis.on("error", console.error);
// console.log(redis);
/**
 * 
 * @param param0 
 * @returns 
 */
export const loader = async ({ request , response }: LoaderFunctionArgs) => {
 
  const test = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("test");
    }, 1000);
  })
    const test1 = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("test");
    }, 1000);
  })
  return defer({ message: "Hello World!", test, test1 });
}; 
 
 
export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect("/login");
};
 
export default function Index() {  
  const lFetcher = useFetcher({ key: "lfetcher"});
  const pFetcher = useFetcher({ key: "test"});
  const submit = useSubmit();
  const data = new FormData();
  data.append("test", "test");
  data.append("array", "test");
  data.append("array", "test1");
  data.append("person.name", "test1");
  data.append("person.surname", "test1");
  data.append("array2.0", "test1");
  data.append("array2.1", "test1");
  data.append("array2.2", "test1");
  data.append("obj", JSON.stringify({ test: "test" }));
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <Button
        onClick={(e) => {
          console.log(e);
          lFetcher.submit(null, { method: "get", action: "/" })
        }}
      >
        FETCHER Loader
      </Button>
      <button
        onClick={() => pFetcher.submit(data, { method: "POST", action: "/" })}
      >
        FETCHER Action
      </button>  
      <button onClick={() => submit(null, { method: "POST", action: "/" })}>
        SUBMIT Action
      </button>
      <button onClick={() => submit(data, { method: "PATCH", action: "/" })}>
        SUBMIT Action PATCH
      </button>
      <button onClick={() => submit(null, { method: "DELETE", action: "/" })}>
        SUBMIT Action DELETE
      </button>
      <button onClick={() => submit(null, { method: "PUT", action: "/" })}>
        SUBMIT Action PUT
      </button> 
     
      <Link to="/login">Login</Link>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
