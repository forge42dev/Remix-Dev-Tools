import type calculateReadingTime from "reading-time";

type MdxPage = {
  code: string;
  editLink: string;
  /**
   * It's annoying that all these are set to optional I know, but there's
   * no great way to ensure that the MDX files have these properties,
   * especially when a common use case will be to edit them without running
   * the app or build. So we're going to force you to handle situations when
   * these values are missing to avoid runtime errors.
   */
  frontmatter: {
    date?: string;
    description?: string;
    image?: {
      blurDataUrl?: string;
      credit: string;
      url: string;
    };
    meta?: {
      [key: string]: string;
    };
    tags?: Array<string>;
    title?: string;
  };
  readTime?: ReturnType<typeof calculateReadingTime>;

  slug: string;
};

/**
 * This is a separate type from MdxPage because the code string is often
 * pretty big and the pages that simply list the pages shouldn't include the code.
 */
type MdxListItem = Omit<MdxPage, "code">;

declare global {
  type Env = { BLOG: string; SESSION_SECRET: string };
}

declare namespace useImageColor {
  type useImageColor = any;
}
