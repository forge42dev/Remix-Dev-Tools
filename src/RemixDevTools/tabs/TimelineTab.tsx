import { Activity } from "lucide-react";
import { FormEvent, RedirectEvent, TimelineEvent } from "../context/timeline";
import { useRDTContext } from "../context/useRDTContext";
import { JsonRenderer } from "../components/jsonRenderer";
import { TAG_COLORS, Tag } from "../components/Tag";

const Translations: Record<TimelineEvent["type"], string> = {
  REDIRECT: "Normal Page navigation",
  FETCHER_REDIRECT: "Page navigation due to fetcher",
  ACTION_REDIRECT: "Page navigation due to action",
  FORM_SUBMISSION: "Form submission",
  FETCHER_SUBMIT: "Form submission from a fetcher",
  ACTION_RESPONSE: "Action response",
  FETCHER_RESPONSE: "Fetcher action response",
};

const RedirectEventComponent = (event: RedirectEvent) => {
  return (
    <div className="rdt-mb-4">
      <time className="rdt-mb-2 rdt-block rdt-text-sm rdt-font-normal rdt-leading-none rdt-text-gray-500">
        Navigated to url: "{event.to + event.search}"
      </time>
      <p className="rdt-mb-4 rdt-text-base rdt-font-normal rdt-text-gray-400">
        {event.hash}
      </p>
      {event.responseData && (
        <p className="rdt-mb-4 rdt-text-base rdt-font-normal rdt-text-gray-400">
          Data received:
          <JsonRenderer data={event.responseData} />
        </p>
      )}
    </div>
  );
};

const FormEventComponent = (event: FormEvent) => {
  const firstPart =
    event.type === "ACTION_REDIRECT"
      ? `Redirect from "${event.to}" to "${event.from}"`
      : `Submission to url: "${event.to}"`;
  const responseData = event.responseData;
  delete responseData?.remixDevTools;
  return (
    <div className="rdt-mb-4">
      <time className="rdt-mb-2 rdt-block rdt-text-sm rdt-font-normal rdt-leading-none rdt-text-gray-500">
        {firstPart} | encType: {event.encType}
      </time>
      <div className="rdt-flex rdt-gap-8">
        {event.data && event.type !== "ACTION_RESPONSE" && (
          <div className="rdt-mb-4 rdt-text-base rdt-font-normal rdt-text-gray-400">
            Data sent:
            <JsonRenderer data={event.data} />
          </div>
        )}
        {responseData && (
          <div className="rdt-mb-4 rdt-text-base rdt-font-normal rdt-text-gray-400">
            Server Response Data:
            <JsonRenderer data={responseData} />
          </div>
        )}
      </div>
    </div>
  );
};

export const METHOD_COLORS: Record<string, keyof typeof TAG_COLORS> = {
  GET: "GREEN",
  POST: "BLUE",
  PUT: "TEAL",
  DELETE: "RED",
  PATCH: "PURPLE",
};

const TimelineTab = () => {
  const { timeline, clearTimeline } = useRDTContext();
  return (
    <div className="rdt-relative rdt-flex rdt-h-full rdt-flex-col rdt-overflow-y-auto rdt-p-6 rdt-px-6">
      {timeline.length > 0 && (
        <button
          onClick={() => clearTimeline()}
          className="rdt-absolute rdt-right-3 rdt-top-0 rdt-z-20 rdt-cursor-pointer rdt-rounded-lg rdt-bg-red-500 rdt-px-3 rdt-py-1 rdt-text-sm rdt-font-semibold rdt-text-white"
        >
          Clear Timeline
        </button>
      )}
      <ol className="rdt-relative">
        {timeline.map((event) => {
          return (
            <li
              key={event.id}
              className="rdt-mb-2 rdt-ml-8 rdt-animate-fade-in-left"
            >
              <span className="rdt-absolute -rdt-left-3 rdt-mt-2 rdt-flex rdt-h-6 rdt-w-6 rdt-animate-fade-in rdt-items-center rdt-justify-center rdt-rounded-full rdt-bg-blue-900 rdt-ring-4 rdt-ring-blue-900">
                <Activity />
              </span>
              <h3 className="-rdt-mt-3 rdt-mb-1 rdt-flex rdt-items-center rdt-gap-2 rdt-text-lg rdt-font-semibold rdt-text-white">
                {Translations[event.type]}
                {event?.method && (
                  <Tag color={METHOD_COLORS[event.method]}>{event.method}</Tag>
                )}
              </h3>
              {event.type === "REDIRECT" ||
              event.type === "FETCHER_REDIRECT" ? (
                <RedirectEventComponent {...event} />
              ) : (
                <FormEventComponent {...event} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export { TimelineTab };
