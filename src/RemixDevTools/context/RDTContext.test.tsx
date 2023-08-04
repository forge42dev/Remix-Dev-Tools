import { render } from "@testing-library/react";
import { RDTContextProvider, REMIX_DEV_TOOLS } from "./RDTContext";

describe("RDTContextProvider", () => {
  it("renders without crashing when localstorage and session storage have no values", () => {
    vi.spyOn(sessionStorage, "getItem").mockReturnValue(null);
    vi.spyOn(localStorage, "getItem").mockReturnValue(null);
    const { container } = render(
      <RDTContextProvider>
        <div>Test</div>
      </RDTContextProvider>
    );
    expect(container).toBeTruthy();
    expect(sessionStorage.getItem).toHaveBeenCalledWith(REMIX_DEV_TOOLS);
    expect(localStorage.getItem).toHaveBeenCalledWith(REMIX_DEV_TOOLS);
  });

  it("renders with existing values retrieved from local and session storage", () => {
    vi.spyOn(sessionStorage, "getItem").mockReturnValue(
      JSON.stringify({
        timeline: [],
      })
    );
    vi.spyOn(localStorage, "getItem").mockReturnValue(
      JSON.stringify({
        position: "top-right",
      })
    );
    const { container } = render(
      <RDTContextProvider>
        <div>Test</div>
      </RDTContextProvider>
    );
    expect(container).toBeTruthy();
    expect(sessionStorage.getItem).toHaveBeenCalledWith(REMIX_DEV_TOOLS);
    expect(localStorage.getItem).toHaveBeenCalledWith(REMIX_DEV_TOOLS);
  });
});
