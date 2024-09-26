import { BrowserChrome } from "~/ui/browser-chrome";
import * as Fakebooks from "~/ui/fakebooks";

export const handle = { forceDark: true };

export default function RoutingIndex() {
  return (
    <div className="pt-8">
      <BrowserChrome url="example.com/sales">
        <Fakebooks.RootView>
          <Fakebooks.SalesView noActiveChild>
            <div className="h-72" />
          </Fakebooks.SalesView>
        </Fakebooks.RootView>
      </BrowserChrome>
    </div>
  );
}
