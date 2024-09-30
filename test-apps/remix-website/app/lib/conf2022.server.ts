import invariant from "tiny-invariant";
import { processMarkdown } from "~/lib/md.server";

import yaml from "yaml";
import { LRUCache } from "lru-cache";
import type {
  ScheduleItem,
  ScheduleItemSpeaker,
  Speaker,
  Sponsor,
  Talk,
} from "./conf";
import {
  isScheduleItemArray,
  isScheduleItemRaw,
  isScheduleItemRawWithSpeakers,
  isSimpleScheduleItemRaw,
  isSpeaker,
  isSpeakerArray,
  isSponsor,
  isSponsorArray,
  isTalk,
  isTalkArray,
  isTalkScheduleItemRaw,
} from "./conf";

import speakersYamlFileContents from "../../data/conf/2022/speakers.yaml?raw";
import sponsorsYamlFileContents from "../../data/conf/2022/sponsors.yaml?raw";
import talksYamlFileContents from "../../data/conf/2022/talks.yaml?raw";
import scheduleYamlFileContents from "../../data/conf/2022/schedule.yaml?raw";
import { slugify } from "~/ui/primitives/utils";

let cache = new LRUCache<
  string,
  Array<Speaker> | Array<Sponsor> | Array<Talk> | Array<ScheduleItem>
>({
  max: 250,
  maxSize: 1024 * 1024 * 12, // 12 mb
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

export async function getSpeakers() {
  let cached = cache.get("speakers");
  if (isSpeakerArray(cached)) {
    return cached;
  }

  let speakersRaw = yaml.parse(speakersYamlFileContents);
  let speakers: Array<Speaker> = [];
  for (let speakerRaw of speakersRaw) {
    let { html: bioHTML } = await processMarkdown(speakerRaw.bio);
    let speakerRawWithDefaults = {
      bioHTML,
      type: "speaker",
      slug: slugify(speakerRaw.name),
      ...speakerRaw,
    };
    invariant(
      isSpeaker(speakerRawWithDefaults),
      `Speaker ${JSON.stringify(
        speakerRaw,
      )} is not valid. Please check the speakers file.`,
    );
    speakers.push({
      ...speakerRawWithDefaults,
    });
  }
  cache.set("speakers", speakers);

  return speakers;
}

export async function getSponsors() {
  let cached = cache.get("sponsors");
  if (isSponsorArray(cached)) {
    return cached;
  }

  let sponsorsRaw = yaml.parse(sponsorsYamlFileContents);
  let sponsors: Array<Sponsor> = [];
  for (let sponsorRaw of sponsorsRaw) {
    invariant(
      isSponsor(sponsorRaw),
      `Sponsor ${JSON.stringify(
        sponsorRaw,
      )} is not valid. Please check the sponsors file.`,
    );
    sponsors.push(sponsorRaw);
  }
  cache.set("sponsors", sponsors);

  return sponsors;
}

export async function getTalks() {
  let cached = cache.get("talks");
  if (isTalkArray(cached)) {
    return cached;
  }

  let talksRaw = yaml.parse(talksYamlFileContents);
  let talks: Array<Talk> = [];
  for (let talkRaw of talksRaw) {
    invariant(
      isTalk(talkRaw),
      `Talk ${JSON.stringify(
        talkRaw,
      )} is not valid. Please check the talks file.`,
    );
    let { html: descriptionHTML } = await processMarkdown(talkRaw.description);
    talks.push({
      ...talkRaw,
      descriptionHTML,
    });
  }
  cache.set("talks", talks);

  return talks;
}

export async function getSchedule() {
  let cached = cache.get("schedule");
  if (isScheduleItemArray(cached)) {
    return cached;
  }

  let allTalks = await getTalks();
  let allSpeakers = await getSpeakers();

  let scheduleItemsRaw = yaml.parse(scheduleYamlFileContents);
  let scheduleItems: Array<ScheduleItem> = [];

  for (let scheduleItemRaw of scheduleItemsRaw) {
    function getSpeakersByName(speakers: Array<string>) {
      return speakers.map((s) => {
        let speaker = allSpeakers.find((speaker) => speaker.name === s);
        invariant(
          speaker,
          `Speaker ${s} is not valid in ${JSON.stringify(
            scheduleItemRaw,
          )}. Please check the schedules file.`,
        );
        return {
          slug: speaker.slug,
          name: speaker.name,
          imgSrc: speaker.imgSrc,
        };
      });
    }
    invariant(
      isScheduleItemRaw(scheduleItemRaw),
      `schedule item ${JSON.stringify(
        scheduleItemRaw,
      )} is not valid. Please check the schedules file.`,
    );
    if (isSimpleScheduleItemRaw(scheduleItemRaw)) {
      let speakers: Array<ScheduleItemSpeaker> = [];
      if (isScheduleItemRawWithSpeakers(scheduleItemRaw)) {
        speakers = getSpeakersByName(scheduleItemRaw.speakers);
      }
      let [{ html: titleHTML }, { html: contentHTML }] = await Promise.all([
        processMarkdown(scheduleItemRaw.title),
        processMarkdown(scheduleItemRaw.content),
      ]);
      scheduleItems.push({
        time: scheduleItemRaw.time,
        titleHTML,
        contentHTML,
        speakers,
      });
    } else if (isTalkScheduleItemRaw(scheduleItemRaw)) {
      let talk = allTalks.find((talk) => talk.title === scheduleItemRaw.talk);
      invariant(
        talk,
        `schedule item ${JSON.stringify(scheduleItemRaw)} references talk ${
          scheduleItemRaw.talk
        } which does not exist.`,
      );
      invariant(
        talk.time === scheduleItemRaw.time,
        `Talk time is set to "${
          talk.time
        }" but that is not the time that is set in the scheduled item (${
          scheduleItemRaw.time
        }) for ${JSON.stringify(scheduleItemRaw)}`,
      );
      let [{ html: titleHTML }, { html: contentHTML }] = await Promise.all([
        processMarkdown(
          talk.type === "lightning"
            ? `<span title="Lightning talk">⚡</span> ${talk.title}`
            : talk.title,
        ),
        processMarkdown(
          talk.description.length > 400
            ? `${talk.description.slice(0, 297).trim()}…`
            : talk.description,
        ),
      ]);
      scheduleItems.push({
        time: scheduleItemRaw.time,
        titleHTML,
        contentHTML,
        speakers: getSpeakersByName(talk.speakers),
      });
    }
  }
  cache.set("schedules", scheduleItems);

  return scheduleItems;
}
