import { Activity } from "lucide-react";
import { FormEvent, RedirectEvent, TimelineEvent } from "../context/timeline";
import { useRDTContext } from "../context/useRDTContext";
import { JsonRenderer } from "../components/jsonRenderer";
import { TAG_COLORS, Tag } from "../components/Tag";

interface TimelineTabProps {}

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
      <time className="rdt-block rdt-mb-2 rdt-text-sm rdt-font-normal rdt-leading-none  rdt-text-gray-500">
        Navigated to url: "{event.to + event.search}"
      </time>
      <p className="rdt-mb-4 rdt-text-base rdt-font-normal   rdt-text-gray-400">
        {event.hash}
      </p>
      {event.responseData && (
        <p className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
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
      <time className="rdt-block rdt-mb-2 rdt-text-sm rdt-font-normal rdt-leading-none   rdt-text-gray-500">
        {firstPart} | encType: {event.encType}
      </time>
      <div className="rdt-flex rdt-gap-8">
        {event.data && event.type !== "ACTION_RESPONSE" && (
          <div className="rdt-mb-4 rdt-text-base rdt-font-normal   rdt-text-gray-400">
            Data sent:
            <JsonRenderer data={event.data} />
          </div>
        )}
        {responseData && (
          <div className="rdt-mb-4 rdt-text-base rdt-font-normal   rdt-text-gray-400">
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

const TimelineTab = ({}: TimelineTabProps) => {
  const { timeline, clearTimeline } = useRDTContext();
  return (
    <div className="rdt-flex rdt-flex-col rdt-h-[40vh] rdt-overflow-y-auto rdt-relative rdt-p-6 rdt-px-6">
      {timeline.length > 0 && (
        <button
          onClick={() => clearTimeline()}
          className="rdt-absolute rdt-z-20 rdt-right-4 rdt-top-0 rdt-cursor-pointer rdt-rounded-lg rdt-bg-red-500 rdt-text-white rdt-px-3 rdt-py-1 rdt-font-semibold rdt-text-sm"
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
              <span className="rdt-absolute rdt-flex rdt-items-center rdt-animate-fade-in rdt-justify-center rdt-w-6 rdt-h-6 rdt-bg-blue-900 rdt-rounded-full -rdt-left-3 rdt-ring-4 rdt-mt-2 rdt-ring-blue-900">
                <Activity />
              </span>
              <h3 className="rdt-flex rdt-items-center -rdt-mt-3 rdt-mb-1 rdt-text-lg rdt-font-semibold rdt-gap-2 rdt-text-white">
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
