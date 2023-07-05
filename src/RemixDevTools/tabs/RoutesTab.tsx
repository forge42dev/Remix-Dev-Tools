import { useEffect, useState } from "react";
import { useGetSocket } from "../hooks/useGetSocket";

interface RoutesTabProps {}

const RoutesTab = ({}: RoutesTabProps) => {
  const [routes, setRoutes] = useState<string[]>([]);
  const { lastJsonMessage, sendJsonMessage } = useGetSocket();
  useEffect(() => {
    if (lastJsonMessage?.type === "routes") {
      setRoutes(lastJsonMessage?.data as any);
    }
    if (lastJsonMessage?.type === "file") {
      console.log(lastJsonMessage);
    }
  }, [lastJsonMessage]);
  useEffect(() => {
    sendJsonMessage({ type: "routes" });
    sendJsonMessage({ type: "get_file", data: "/dashboard" });
  }, []);
  return (
    <div>
      {routes?.map((route) => (
        <div key={route}>{route}</div>
      ))}
    </div>
  );
};

export { RoutesTab };
