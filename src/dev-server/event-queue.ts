import { getSingleton, setSingleton, singleton } from "./singleton.js";

singleton("rdtEventQueue", () => []);

interface RDTEvent<Type extends string, Data extends Record<string, unknown> | any[]> {
  type: Type;
  data: Data;
}

export type LoaderEvent = RDTEvent<
  "loader",
  {
    id: string;
    executionTime: number;
    requestData: any;
    requestHeaders: Record<string, string>;
    responseHeaders: Record<string, string>;
    timestamp: number;
  }
>;
export type ActionEvent = RDTEvent<
  "action",
  {
    id: string;
    executionTime: number;
    requestData: any;
    requestHeaders: Record<string, string>;
    responseHeaders: Record<string, string>;
    timestamp: number;
  }
>;

export type RDTEventArray = RDTEvent<"events", (LoaderEvent | ActionEvent)[]>;

export type WsEventType = RDTEventArray;

export const isRdtEvent = <Type extends string, Data extends Record<string, unknown>>(
  obj: unknown
): obj is RDTEvent<Type, Data> => {
  return typeof obj === "object" && obj !== null && "type" in obj && "data" in obj;
};

export const isRdtEventArray = (obj: unknown): obj is RDTEventArray => {
  return isRdtEvent(obj) && obj.type === "events" && Array.isArray(obj.data);
};

export const storeEvent = <T extends string, U extends Record<string, unknown>>(event: RDTEvent<T, U>) => {
  const queue = singleton<RDTEvent<string, Record<string, unknown>>[]>("rdtEventQueue", () => {
    return [];
  });
  queue.push(event);
  if (queue.length > 40) {
    setSingleton("rdtEventQueue", queue.slice(queue.length - 40, queue.length));
  }
};

export const getEvents = () => {
  const queue = getSingleton<RDTEvent<string, Record<string, unknown>>[]>("rdtEventQueue");
  return queue;
};
