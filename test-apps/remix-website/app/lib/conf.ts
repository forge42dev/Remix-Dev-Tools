export type Speaker = {
  name: string;
  type: "emcee" | "speaker";
  linkText: string;
  link: string;
  title: string;
  imgSrc: string;
  bioHTML: string;
  slug: string;
};

export type SponsorLevel = "premier" | "gold" | "silver" | "community";

export interface Sponsor {
  name: string;
  link: string;
  imgSrc: string;
  level: SponsorLevel;
  about?: string;
}

export interface Talk {
  title: string;
  description: string;
  descriptionHTML: string;
  time?: string;
  type: "regular" | "lightning" | "backup";
  speakers: Array<string>;
}

export type ScheduleItemSpeaker = {
  slug: string;
  imgSrc: string;
  name: string;
};

export type SimpleScheduleItemRaw = {
  time: string;
  title: string;
  content: string;
  speakers?: Array<string>;
};

export type TalkScheduleItemRaw = {
  time: string;
  talk: string;
};

type ScheduleItemRaw = SimpleScheduleItemRaw | TalkScheduleItemRaw;

export type ScheduleItem = {
  time: string;
  titleHTML: string;
  contentHTML: string;
  speakers?: Array<ScheduleItemSpeaker>;
};

export function isSpeaker(obj: any): obj is Speaker {
  return (
    obj &&
    typeof obj === "object" &&
    obj.name &&
    obj.title &&
    obj.imgSrc &&
    obj.linkText &&
    obj.link &&
    obj.bioHTML &&
    ["emcee", "speaker"].includes(obj.type)
  );
}

export function isSponsor(obj: unknown): obj is Sponsor {
  return !!(
    obj &&
    typeof obj === "object" &&
    "name" in obj &&
    typeof obj.name === "string" &&
    "link" in obj &&
    typeof obj.link === "string" &&
    "imgSrc" in obj &&
    typeof obj.imgSrc === "string" &&
    (!("about" in obj) || typeof obj.about === "string") &&
    "level" in obj &&
    ["premier", "gold", "silver", "community"].includes(obj.level as string)
  );
}

export function isTalk(obj: any): obj is Talk {
  return (
    obj &&
    typeof obj === "object" &&
    obj.title &&
    obj.description &&
    Array.isArray(obj.speakers) &&
    ["regular", "lightning", "backup"].includes(obj.type) &&
    (!obj.time || typeof obj.time === "string") &&
    obj.speakers.every((item: any) => typeof item === "string")
  );
}

export function isSimpleScheduleItemRaw(
  obj: any,
): obj is SimpleScheduleItemRaw {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.time === "string" &&
    typeof obj.title === "string" &&
    typeof obj.content === "string" &&
    (!obj.speakers ||
      (Array.isArray(obj.speakers) &&
        obj.speakers.every((item: any) => typeof item === "string")))
  );
}

export function isTalkScheduleItemRaw(obj: any): obj is TalkScheduleItemRaw {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.time === "string" &&
    typeof obj.talk === "string"
  );
}

export function isScheduleItemRaw(obj: any): obj is ScheduleItemRaw {
  return isSimpleScheduleItemRaw(obj) || isTalkScheduleItemRaw(obj);
}

export function isScheduleItemRawWithSpeakers(
  obj: any,
): obj is SimpleScheduleItemRaw & { speakers: Array<string> } {
  return (
    isSimpleScheduleItemRaw(obj) &&
    Array.isArray(obj.speakers) &&
    obj.speakers.every((s: any) => typeof s === "string")
  );
}

export function isScheduleItem(obj: any): obj is ScheduleItem {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.time === "string" &&
    typeof obj.title === "string" &&
    typeof obj.content === "string" &&
    (obj.speakers
      ? Array.isArray(obj.speakers) &&
        obj.speakers.every(
          (s: any) =>
            s &&
            typeof s === "object" &&
            typeof s.slug === "string" &&
            typeof s.imgSrc === "string" &&
            typeof s.name === "string",
        )
      : true)
  );
}

export function isSpeakerArray(arr: any): arr is Array<Speaker> {
  return Array.isArray(arr) && arr.every(isSpeaker);
}

export function isSponsorArray(arr: any): arr is Array<Sponsor> {
  return Array.isArray(arr) && arr.every(isSponsor);
}

export function isTalkArray(arr: any): arr is Array<Talk> {
  return Array.isArray(arr) && arr.every(isTalk);
}

export function isScheduleItemArray(arr: any): arr is Array<ScheduleItem> {
  return Array.isArray(arr) && arr.every(isScheduleItem);
}
