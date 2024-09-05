export type OpenSourceData = {
  type: "open-source";
  data: {
    /** The source file to open */
    source?: string;
    /** The remix route ID, usually discovered via the hook useMatches */
    routeID?: string;
    /** The line number in the source file */
    line?: number;
    /** The column number in the source file */
    column?: number;
  };
};
