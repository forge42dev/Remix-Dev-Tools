import clsx from "clsx";
import { useState } from "react";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { useGetSocket } from "../hooks/useGetSocket";

interface NewRouteOptions {
  path: string;
  loader: boolean;
  action: boolean;
  headers: boolean;
  errorBoundary: boolean;
  revalidate: boolean;
  handler: boolean;
  meta: boolean;
  links: boolean;
}

const DEFAULT_VALUES = {
  path: "",
  loader: false,
  action: false,
  headers: false,
  errorBoundary: false,
  revalidate: false,
  handler: false,
  meta: false,
  links: false,
};

const NewRouteForm = () => {
  const { sendJsonMessage } = useGetSocket({
    onMessage: (e) => {
      const messageData = e.data;
      if (messageData.type === "route_added") {
        setNewRouteInfo(DEFAULT_VALUES);
      }
    },
  });
  const [newRouteInfo, setNewRouteInfo] =
    useState<NewRouteOptions>(DEFAULT_VALUES);

  const handleSubmit = () => {
    const { path, ...options } = newRouteInfo;
    sendJsonMessage({
      type: "add_route",
      path,
      options,
    });
  };

  const setNewInfo = (info: Partial<NewRouteOptions>) => {
    setNewRouteInfo({ ...newRouteInfo, ...info });
  };
  return (
    <div className="rdt-mb-2 rdt-rounded-lg rdt-border rdt-border-gray-500/20 rdt-p-2">
      <label className="rdt-mb-2 rdt-block ">Route path:</label>
      <Input
        onBlur={() =>
          setNewInfo({
            path: newRouteInfo.path.trim(),
          })
        }
        onChange={(e) => setNewInfo({ path: e.target.value })}
        className="rdt-mb-1"
      />
      <span className="rdt-mb-4 rdt-block rdt-text-gray-500">
        This will be added to your routes folder under your entered name,
        exclude the extension
      </span>
      <label className="rdt-mb-2 rdt-block">Additional options:</label>
      <Checkbox
        value={newRouteInfo.loader}
        onChange={() =>
          setNewInfo({
            loader: !newRouteInfo.loader,
          })
        }
        id="loader"
      >
        Add a loader
      </Checkbox>
      <Checkbox
        value={newRouteInfo.action}
        onChange={() =>
          setNewInfo({
            action: !newRouteInfo.action,
          })
        }
        id="action"
      >
        Add an action
      </Checkbox>
      <Checkbox
        value={newRouteInfo.errorBoundary}
        onChange={() =>
          setNewInfo({
            errorBoundary: !newRouteInfo.errorBoundary,
          })
        }
        id="error-boundary"
      >
        Add an error boundary
      </Checkbox>
      <Checkbox
        value={newRouteInfo.handler}
        onChange={() =>
          setNewInfo({
            handler: !newRouteInfo.handler,
          })
        }
        id="handle"
      >
        Add a handle
      </Checkbox>
      <Checkbox
        value={newRouteInfo.meta}
        onChange={() => setNewInfo({ meta: !newRouteInfo.meta })}
        id="meta"
      >
        Add a meta export
      </Checkbox>
      <Checkbox
        value={newRouteInfo.links}
        onChange={() => setNewInfo({ links: !newRouteInfo.links })}
        id="links"
      >
        Add a links export
      </Checkbox>
      <Checkbox
        value={newRouteInfo.headers}
        onChange={() =>
          setNewInfo({
            headers: !newRouteInfo.headers,
          })
        }
        id="headers"
      >
        Add a headers export
      </Checkbox>
      <Checkbox
        value={newRouteInfo.revalidate}
        onChange={() =>
          setNewInfo({
            revalidate: !newRouteInfo.revalidate,
          })
        }
        id="shouldRevalidate"
      >
        Add a shouldRevalidate export
      </Checkbox>
      <button
        onClick={handleSubmit}
        disabled={!newRouteInfo.path}
        className={clsx(
          "rdt-mr-2 rdt-mt-2 rdt-self-end rdt-rounded rdt-border rdt-border-gray-400 rdt-px-2 rdt-py-1 rdt-text-sm",
          !newRouteInfo.path && "rdt-opacity-50"
        )}
      >
        Add route
      </button>
    </div>
  );
};

export { NewRouteForm };
