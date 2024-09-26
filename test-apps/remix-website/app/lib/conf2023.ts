import type { DateTime } from "luxon";

export function validateSessionizeSpeakerData(
  data: unknown,
): asserts data is SessionizeSpeakerData {
  if (
    data == null ||
    typeof data !== "object" ||
    !("id" in data) ||
    !("firstName" in data) ||
    !("lastName" in data) ||
    !("fullName" in data) ||
    !("tagLine" in data) ||
    !("links" in data) ||
    !("questionAnswers" in data) ||
    !("profilePicture" in data) ||
    !("isTopSpeaker" in data) ||
    (data.links != null && !Array.isArray(data.links)) ||
    (data.questionAnswers != null && !Array.isArray(data.questionAnswers))
  ) {
    throw new Error("Invalid speaker data");
  }
}

export function validateSessionizeSessionData(
  data: unknown,
): asserts data is SessionizeSessionData {
  if (
    data == null ||
    typeof data !== "object" ||
    !("id" in data)
    // !("title" in data) ||
    // !("description" in data) ||
    // !("startsAt" in data) ||
    // !("endsAt" in data)
    // TODO: ...
  ) {
    throw new Error("Invalid session data");
  }
}

export interface Speaker {
  id: string;
  nameFirst: string;
  nameLast: string;
  nameFull: string;
  slug: string;
  bio: string | null;
  tagLine: string | null;
  imgUrl: string | null;
  twitterHandle: string | null;
  isTopSpeaker: boolean;
  isEmcee: boolean;
  links: Array<{
    title: string;
    linkType: "Twitter" | "LinkedIn" | "Blog" | "Company_Website";
    url: string;
  }>;
}

export interface SpeakerSession {
  id: string;
  title: string;
  description: string | null;
  startsAt: DateTime | null;
  endsAt: DateTime | null;
  speakers: Array<{ id: string; slug: string; name: string }>;
}

export interface ScheduleSession {
  id: string;
  room: string;
  title: string;
  description: string | null;
  startsAt: DateTime;
  endsAt: DateTime;
  speakers: Array<{
    id: string;
    slug: string;
    nameFirst: string | null;
    nameLast: string | null;
    nameFull: string;
    imgUrl: string | null;
  }>;
}

export interface Schedule {
  date: DateTime;
  sessions: ScheduleSession[];
}

export interface SessionizeSpeakerData {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  tagLine: string | null;
  bio: string | null;
  links: Array<{
    title: string;
    linkType: "Twitter" | "LinkedIn" | "Blog" | "Company_Website";
    url: string;
  }> | null;
  questionAnswers: Array<{
    question: string;
    answer: string | null;
  }> | null;
  profilePicture: string | null;
  isTopSpeaker: boolean;
}

export interface SessionizeSessionData {
  id: number | string;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isServiceSession: boolean;
  isPlenumSession: boolean;
  speakers: Array<{ id: string; name: string }>;
  categories: Array<{
    id: string;
    name: string;
    categoryItems: Array<{ id: string; name: string }>;
  }>;
  roomId: number | null;
  room: string | null;
  status: string;
}
