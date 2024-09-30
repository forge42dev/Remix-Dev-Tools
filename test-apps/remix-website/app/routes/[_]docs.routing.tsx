import { InteractiveRoutes } from "~/ui/homepage-scroll-experience";

export const handle = { forceDark: true };

export default function Routing() {
  return (
    <div className="pt-8">
      <InteractiveRoutes />
    </div>
  );
}
