import { useMatches } from "@remix-run/react";

interface PageTabProps {}

const PageTab = ({}: PageTabProps) => {
  const routes = useMatches();

  return (
    <>
      {routes.map((route) => {
        return (
          <div key={route.id}>
            {route.data?.remixDevTools &&
              Object.entries(route.data?.remixDevTools).map(([key, value]) => {
                return (
                  <div key={key}>
                    <div>{key}</div>
                    <div>{JSON.stringify(value)}</div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </>
  );
};

export { PageTab };
