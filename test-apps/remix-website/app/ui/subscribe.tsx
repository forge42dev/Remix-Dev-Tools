import * as React from "react";
import { useFetcher } from "@remix-run/react";
import type { FormProps, FetcherWithComponents } from "@remix-run/react";
import { Button, Input } from "./buttons";
import cx from "clsx";
import type { action } from "~/routes/[_]actions.newsletter";
import type { SerializeFrom } from "@remix-run/node";

function Subscribe({
  descriptionId,
  formClassName = "flex gap-4 flex-col",
}: {
  descriptionId: string;
  formClassName?: string;
}) {
  return (
    <div>
      <SubscribeProvider>
        <SubscribeForm
          className={formClassName}
          aria-describedby={descriptionId}
        >
          <SubscribeEmailInput />
          <SubscribeSubmit />
        </SubscribeForm>
        <SubscribeStatus />
      </SubscribeProvider>
    </div>
  );
}

function SubscribeProvider({ children }: { children: React.ReactNode }) {
  let subscribe = useFetcher<typeof action>();
  let inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (subscribe.state === "idle" && subscribe.data?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [subscribe.state, subscribe.data]);

  return (
    <SubscribeContext.Provider value={{ fetcher: subscribe, inputRef }}>
      {children}
    </SubscribeContext.Provider>
  );
}

const SubscribeContext = React.createContext<null | {
  fetcher: FetcherWithComponents<SerializeFrom<typeof action>>;
  inputRef: React.RefObject<HTMLInputElement>;
}>(null);

function useSubscribeContext() {
  let ctx = React.useContext(SubscribeContext);
  if (!ctx)
    throw Error(
      "SubscribeForm components must be used inside of a SubscribeProvider",
    );
  return ctx;
}

function SubscribeForm({
  className = "flex gap-4 flex-col",
  children,
  ...props
}: SubscribeFormProps) {
  let { fetcher: subscribe } = useSubscribeContext();

  return (
    <subscribe.Form
      action="/_actions/newsletter"
      method="post"
      className={cx(className, {
        "opacity-50": subscribe.state === "submitting",
      })}
      {...props}
    >
      {children}
    </subscribe.Form>
  );
}

interface SubscribeFormProps extends Omit<FormProps, "replace" | "method"> {
  descriptionId?: string;
  className?: string;
  children: React.ReactNode;
}

const SubscribeInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithRef<"input">, "value">
>(
  (
    {
      children,
      className = "w-full sm:w-auto sm:flex-1 dark:placeholder-gray-500",
      ...props
    },
    forwardedRef,
  ) => {
    return <Input ref={forwardedRef} className={className} {...props} />;
  },
);

SubscribeInput.displayName = "SubscribeInput";

const SubscribeEmailInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithoutRef<"input">, "type" | "name" | "value">
>(({ placeholder = "you@example.com", ...props }, forwardedRef) => {
  let { fetcher, inputRef } = useSubscribeContext();
  let ref = useComposedRefs(inputRef, forwardedRef);
  return (
    <SubscribeInput
      ref={ref}
      type="email"
      name="email"
      placeholder={placeholder}
      {...props}
      aria-invalid={
        props["aria-invalid"] ??
        (Boolean((fetcher as any).data?.error) || undefined)
      }
    />
  );
});
SubscribeEmailInput.displayName = "SubscribeEmailInput";

function SubscribeSubmit({
  children = "Subscribe",
  onClick,
  className = "w-full mt-2 sm:w-auto sm:mt-0 uppercase",
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "type">) {
  let { fetcher } = useSubscribeContext();
  return (
    <Button
      onClick={(event) => {
        onClick?.(event);
        if (fetcher.state === "submitting") {
          event.preventDefault();
        }
      }}
      type="submit"
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

function SubscribeStatus() {
  let { fetcher: subscribe } = useSubscribeContext();
  let { isSuccessful } =
    subscribe.state === "idle" && subscribe.data?.ok
      ? { isSuccessful: true }
      : { isSuccessful: false };
  let { isError, error } =
    subscribe.state === "idle" && subscribe.data?.error
      ? { isError: true, error: subscribe.data.error }
      : { isError: false, error: null };

  return (
    <div aria-live="polite" className="py-2">
      {isSuccessful && (
        <div className="text-white">
          <b className="text-green-brand">Got it!</b> Please go{" "}
          <b className="text-red-brand">check your email</b> to confirm your
          subscription, otherwise you won't get our email.
        </div>
      )}
      {isError && <div className="text-red-brand">{error}</div>}
    </div>
  );
}

export {
  Subscribe,
  SubscribeProvider,
  SubscribeForm,
  SubscribeInput,
  SubscribeEmailInput,
  SubscribeSubmit,
  SubscribeStatus,
};

function useComposedRefs<T>(...refs: React.Ref<T>[]) {
  return React.useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          try {
            (ref as React.MutableRefObject<T | null>).current = node;
          } catch (_) {}
        }
      });
    },
    [refs],
  );
}
