import { meta, loader, default as DocsPage } from "~/routes/docs.$lang.$ref.$";

function SplatPage() {
  return <DocsPage />;
}

export default SplatPage;
export { meta, loader };
