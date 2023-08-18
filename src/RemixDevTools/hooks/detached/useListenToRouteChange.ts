import { useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { useRef } from "react";
import { useAttachListener } from "../useAttachListener";
import { getStorageItem, setStorageItem } from "../../utils/storage";

export const LOCAL_STORAGE_ROUTE_KEY = "rdt_route";

export const setRouteInLocalStorage = (route: string) => setStorageItem(LOCAL_STORAGE_ROUTE_KEY, route);

export const getRouteFromLocalStorage = () => getStorageItem(LOCAL_STORAGE_ROUTE_KEY);

export const useListenToRouteChange = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const ref = useRef(location.pathname);

  useAttachListener("storage", "window", (e: any) => {
    if (e.key !== LOCAL_STORAGE_ROUTE_KEY) {
      return;
    }

    const route = getRouteFromLocalStorage();

    if (route && route !== ref.current && route !== navigation.location?.pathname && navigation.state === "idle") {
      ref.current = route;
      navigate(route);
    }
  });
};
