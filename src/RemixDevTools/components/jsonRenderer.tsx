import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";

interface JsonRendererProps {
  data: string | Record<string, unknown>;
}

const JsonRenderer = ({ data }: JsonRendererProps) => {
  if (typeof data === "string") {
    return <div className="rdt-text-green-600">{data}</div>;
  }
  return <JsonView collapsed={0} style={{ ...(darkTheme as any) }} value={data} />;
};

export { JsonRenderer };
