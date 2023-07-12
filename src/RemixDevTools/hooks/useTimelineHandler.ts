import {
  useActionData,
  useFetcher,
  useFetchers,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useRDTContext } from "../context/useRDTContext";
import { TimelineEvent } from "../context/timeline";

const useTimelineHandler = () => {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const fetcher = useFetcher();

  const { setTimelineEvent } = useRDTContext();
  const responseData = useActionData();

  useEffect(() => {
    const { state, location, formAction, formData, formEncType, formMethod } =
      navigation;
    if (state === "idle") {
      return;
    }
    const { pathname, search, hash, state: locState } = location;
    if (state === "submitting") {
      const data =
        formData && formData.entries
          ? Object.fromEntries(formData.entries())
          : undefined;
      return setTimelineEvent({
        type: "FORM_SUBMISSION",
        from: pathname,
        to: formAction,
        method: formMethod,
        data: data && Object.keys(data).length > 0 ? data : undefined,
        encType: formEncType,
        id: (Math.random() * Date.now()).toString(),
      });
    }
    if (state === "loading") {
      if (formAction && formData && formMethod && locState?._isRedirect) {
        const data =
          formData && formData.entries
            ? Object.fromEntries(formData.entries())
            : undefined;
        return setTimelineEvent({
          type: "ACTION_REDIRECT",
          from: pathname,
          to: formAction,
          method: formMethod,
          data: data && Object.keys(data).length > 0 ? data : undefined,
          encType: formEncType,
          responseData,
          id: (Math.random() * Date.now()).toString(),
        });
      }
      if (formAction && formData && formMethod) {
        const data =
          formData && formData.entries
            ? Object.fromEntries(formData.entries())
            : undefined;
        return setTimelineEvent({
          type: "ACTION_RESPONSE",
          from: pathname,
          to: formAction,
          method: formMethod,
          data: data && Object.keys(data).length > 0 ? data : undefined,
          encType: formEncType,
          responseData,
          id: (Math.random() * Date.now()).toString(),
        });
      }
      return setTimelineEvent({
        type:
          locState?._isFetchActionRedirect || locState?._isFetchLoaderRedirect
            ? "FETCHER_REDIRECT"
            : "REDIRECT",
        to: pathname,
        search,
        hash,
        method: "GET",

        id: (Math.random() * Date.now()).toString(),
      });
    }
  }, [navigation]);

  const fetcherEventQueue = useRef<TimelineEvent[]>([]);
  useEffect(() => {
    const activeFetchers = fetchers.filter((f) => f.state !== "idle");

    // fix this to work with fetcher submission that return data from be
    if (activeFetchers.length === 0 && fetcherEventQueue.current.length > 0) {
      console.log(fetchers);

      fetcherEventQueue.current.map(({ position, ...event }: any) =>
        setTimelineEvent({
          ...event,
          responseData: fetchers[position]?.data,
          id: (Math.random() * Date.now()).toString(),
        })
      );
      fetcherEventQueue.current = [];
      return;
    }

    fetchers.forEach((fetcher, i) => {
      if (fetcher.state === "idle") return;

      const { data, formAction, formData, formEncType, formMethod } = fetcher;
      /* if (navigation.state !== "idle") {
        return;
      } */

      if (formAction && formMethod) {
        const form =
          formData && formData.entries
            ? Object.fromEntries(formData.entries())
            : undefined;
        const event = {
          type: "FETCHER_SUBMIT",
          to: formAction,
          method: formMethod,
          data: form && Object.keys(form).length > 0 ? form : undefined,
          encType: formEncType as any,
          responseData: data,
          position: i,
        };

        return (fetcherEventQueue.current = [
          ...fetcherEventQueue.current,
          event as any,
        ]);
      }
    });
  }, [fetchers]);
};

export { useTimelineHandler };
