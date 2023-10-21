import { Icon } from "../components/icon/Icon.js";
import { useHtmlErrors } from "../context/useRDTContext.js";
import { useDevServerConnection } from "../hooks/useDevServerConnection.js";

const ErrorsTab = () => {
  const { htmlErrors } = useHtmlErrors();
  const { sendJsonMessage } = useDevServerConnection();
  return (
    <div className="rdt-flex rdt-flex-col rdt-gap-1">
      {htmlErrors.length > 0 ? (
        <>
          <h1 className="rdt-text-xl">HTML Nesting Errors</h1>
          <hr className="rdt-mb-1 rdt-border-gray-600/30" />
        </>
      ) : (
        <h1 className="rdt-text-xl">No errors detected!</h1>
      )}
      {htmlErrors.map((error) => {
        return (
          <div
            key={JSON.stringify(error)}
            className="rdt-flex rdt-justify-start rdt-gap-2 rdt-rounded-lg rdt-border rdt-border-solid rdt-border-red-600/20 rdt-p-2"
          >
            <Icon size="md" className="rdt-text-red-600" name="Shield" />
            <div className="rdt-flex rdt-flex-col">
              <div>
                <span className="rdt-font-bold rdt-text-red-600">{error.child.tag}</span> element can't be nested inside
                of <span className="rdt-font-bold rdt-text-red-600">{error.parent.tag}</span> element
              </div>
              <div className="rdt-flex rdt-items-center rdt-gap-1 rdt-text-sm rdt-text-gray-500">
                The parent element is located inside of the
                <div
                  onClick={() =>
                    sendJsonMessage({
                      type: "open-source",
                      data: { source: error.parent.file.replace(".tsx", "") },
                    })
                  }
                  className="rdt-cursor-pointer rdt-text-white"
                >
                  {error.parent.file}
                </div>
                file
              </div>
              <div className="rdt-flex rdt-items-center rdt-gap-1 rdt-text-sm rdt-text-gray-500">
                The child element is located inside of the
                <div
                  onClick={() =>
                    sendJsonMessage({
                      type: "open-source",
                      data: { source: error.child.file.replace(".tsx", "") },
                    })
                  }
                  className="rdt-cursor-pointer rdt-text-white"
                >
                  {error.child.file}
                </div>
                file
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { ErrorsTab };
