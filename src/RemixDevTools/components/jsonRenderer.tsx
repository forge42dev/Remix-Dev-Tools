import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";
import { useMemo, useState } from "react";
import { useSettingsContext } from "../context/useRDTContext";

interface JsonRendererProps {
  data: string | Record<string, unknown>;
}

const isPromise = (value: any): value is Promise<any> => {
  return value && typeof value.then === "function";
};

const JsonRenderer = ({ data }: JsonRendererProps) => {
  const { settings } = useSettingsContext();
  const originalData = useMemo(
    () =>
      typeof data === "string"
        ? data
        : Object.entries(data)
            .map(([key, value]) => {
              if (isPromise(value)) {
                value.then((res) => {
                  setJson((json: any) => ({
                    ...json,
                    [key]: res,
                  }));
                });
                return { [key]: "Loading deferred data..." };
              }
              return { [key]: value };
            })
            .reduce((acc, curr) => {
              return { ...acc, ...curr };
            }, {}),
    [data]
  );
  const [json, setJson] = useState(originalData);

  if (typeof json === "string") {
    return <div className="rdt-text-green-600">{json}</div>;
  }

  return (
    <JsonView highlightUpdates collapsed={settings.expansionLevel} style={{ ...(darkTheme as any) }} value={json} />
  );
};

export { JsonRenderer };
