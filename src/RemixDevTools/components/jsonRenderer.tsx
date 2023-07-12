import { JsonView, darkStyles, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

interface JsonRendererProps {
  data: string | Record<string, unknown>;
  levelsShown?: number;
}

const JsonRenderer = ({ data, levelsShown = 0 }: JsonRendererProps) => {
  return (
    <JsonView
      shouldInitiallyExpand={(level) => level < levelsShown}
      style={{
        ...darkStyles,
        basicChildStyle: "rdt-ml-4",
        container: "-rdt-ml-4",
        punctuation: "rdt-mr-2 ",
        pointer: "rdt-mr-2 rdt-text-white rdt-text-lg",
        label: "rdt-mr-1 rdt-text-white/80",
        stringValue: "rdt-text-green-500",
        numberValue: "rdt-text-orange-500",
        nullValue: "rdt-text-blue-500",
        undefinedValue: "rdt-text-blue-500",
        booleanValue: "rdt-text-purple-500",
      }}
      data={data}
    />
  );
};

export { JsonRenderer };
