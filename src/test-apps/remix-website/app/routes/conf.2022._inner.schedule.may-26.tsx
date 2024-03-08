import { Link, useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { metaV1 } from "@remix-run/v1-meta";
import { Discord } from "~/ui/icons";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "May 26th at Remix Conf",
    description:
      "May 26th is the day after the conference. Get together with other conference attendees before heading home.",
  });
};

function getMapsDirections(address: string) {
  const url = new URL("http://maps.google.com/maps");
  url.searchParams.append(
    "saddr",
    "Sheraton Salt Lake City Hotel, 150 West 500 South Salt Lake City, Utah 84101",
  );
  url.searchParams.append("daddr", address);
  return url.toString();
}

type Activity = {
  emoji: string;
  name: string;
  description: string;
  discordLink: string;
} & (
  | {
      link?: never;
      address?: never;
      walkingDistance?: never;
    }
  | {
      link: string;
      address: string;
      walkingDistance: boolean;
    }
);

const activities: Array<Activity> = [
  {
    name: "Dave n Busters",
    emoji: "🎮",
    link: "https://www.daveandbusters.com/locations/salt-lake-city",
    description: "Food, drinks, video games, and sports.",
    address: "140 S Rio Grande St, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935586397350428773",
    walkingDistance: true,
  },
  {
    name: "The Grid",
    emoji: "🏎",
    link: "https://www.thegrid.com/",
    description: "Racing, arcade gaming, live entertainment, and dining.",
    address: "593 S Evermore Ln, Pleasant Grove, UT 84062",
    discordLink:
      "https://discord.com/channels/770287896669978684/935586523473125406",
    walkingDistance: false,
  },
  {
    name: "Boondocks",
    emoji: "⛳",
    link: "https://draper.boondocks.com/",
    description:
      "Laser tag, arcade, VR, minigolf, bumper boats, go-karts, and food.",
    address: "75 Southfork Dr, Draper, UT 84020",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587117793427496",
    walkingDistance: false,
  },
  {
    name: "Social Axe Throwing",
    emoji: "🔪",
    link: "https://slc.socialaxethrowing.com/slc/",
    description:
      "If you haven't been axe throwing, it's more fun than you think.",
    address: "1154 S 300 W E, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587497570877541",
    walkingDistance: true,
  },
  {
    name: "Leonardo Emersive Art",
    emoji: "🎨",
    link: "https://theleonardo.org/exhibits/current-exhibits/art-through-experience/",
    description:
      "Immersive exhibits that bring colors, art, and movement to life through 4k projections. (Tickets must be purchased in advance).",
    address: "209 East 500 South, Suite 301, Salt Lake City, UT 84111",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587662428004372",
    walkingDistance: true,
  },
  {
    name: "Movies at the Gateway",
    emoji: "🍿",
    link: "https://www.megaplextheatres.com/gateway",
    description: "It's a great movie theater. Go watch a movie!",
    address: "400 W 200 S, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935587789515403285",
    walkingDistance: true,
  },
  {
    name: "Fat Cats",
    emoji: "🎳",
    link: "https://www.fatcatsfun.com/saltlakecity",
    description: "Bowling, arcade, VR, mini-golf, and food.",
    address: "3739 S 900 E, Millcreek, UT 84106",
    discordLink:
      "https://discord.com/channels/770287896669978684/935588005341704212",
    walkingDistance: false,
  },
  {
    name: "Get Out Game",
    emoji: "🧩",
    link: "https://getoutgames.com/escape-room-salt-lake-city/",
    description: "Escape Room (very close to the hotel).",
    address: "202 W 400 S, Salt Lake City, UT 84101",
    discordLink:
      "https://discord.com/channels/770287896669978684/935588244471566366",
    walkingDistance: true,
  },
  {
    name: "The Living Planet",
    emoji: "🐧",
    link: "https://thelivingplanet.com/",
    description: "Aquarium and food.",
    address: "12033 Lone Peak Pkwy, Draper, UT 84020",
    discordLink:
      "https://discord.com/channels/770287896669978684/935588448469934120",
    walkingDistance: false,
  },
  {
    name: "Creekside Park (Disc Golf)",
    emoji: "🥏",
    link: "https://udisc.com/courses/creekside-park-LMk1",
    description: "Disc golf is a blast, even if you've never tried before",
    address: "1592 E Murray Holladay Rd, Holladay, UT 84117",
    discordLink:
      "https://discord.com/channels/770287896669978684/935657377867378798",
    walkingDistance: false,
  },
  {
    name: "Soccer (or more properly: fútbol)",
    emoji: "⚽",
    description:
      "Bring your shin guards and cleats! We'd love to see you there no matter your skill level.",
    discordLink:
      "https://discord.com/channels/770287896669978684/936018830709362698",
  },
  {
    name: "Ogden Marathon (week before)",
    emoji: "🏃",
    link: "https://www.ogdenmarathon.com/",
    address: "Dee Events Center, 4400 Harrison Blvd., Ogden, UT 84403",
    description:
      "The Saturday before the conference is the Ogden Marathon. So bring your running shoes and train up!",
    discordLink:
      "https://discord.com/channels/770287896669978684/940664027271528518",
    walkingDistance: false,
  },
  {
    name: "Riding around SLC",
    emoji: "🛴",
    link: "https://www.visitsaltlake.com/plan-your-trip/getting-around/electric-scooters/",
    address:
      "Sheraton Salt Lake City Hotel, 150 W 500 S, Salt Lake City, UT 84101",
    description:
      "Let's ride! If you've got a personal electric mobility device (like a onewheel/electric skateboard/etc.), join us for a ride around Salt Lake City. Don't have one (or can't fly with it)? Grab a lime scooter and join us!",
    discordLink:
      "https://discord.com/channels/770287896669978684/943032944988155946",
    walkingDistance: true,
  },
  {
    name: "Pickleball",
    emoji: "🎾",
    link: "https://www.slc.gov/parks/parks-division/5th-ave-c-street-pickleball/",
    address:
      "5th Ave & C Street Pickleball Courts, 230 C St E, Salt Lake City, UT 84103",
    description: "Grab your paddle and let's play pickleball!",
    discordLink:
      "https://discord.com/channels/770287896669978684/946145901896925215",
    walkingDistance: false,
  },
  {
    name: "Ultimate Frisbee",
    emoji: "🥏",
    link: "https://www.slc.gov/parks/parks-division/pioneer-park/",
    address: "Pioneer Park, 350 S 300 W, Salt Lake City, UT 84101",
    description: "Let's play ultimate!",
    discordLink:
      "https://discord.com/channels/770287896669978684/946161999245635614",
    walkingDistance: true,
  },
];

type LoaderData = { activities: Array<Activity> };

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    activities: activities.sort(() => Math.random() - 0.5),
  });
};

export default function May25Schedule() {
  // Our internal serialization type struggles a bit with the union/intersection
  // type we use for Activity
  const { activities } = useLoaderData() as LoaderData;
  return (
    <div>
      <p>
        This is post-conference day! Get together with other conference
        attendees before heading home. The conference organizers will facilitate
        getting folks together who want to do the same thing and help you know
        fun places to go hang out. Here are some possibilities:
      </p>
      <ul className="space-y-2 pt-6">
        {activities.map((activity) => (
          <li key={activity.name}>
            <span className="pr-2">{activity.emoji}</span>
            {activity.link ? (
              <a className="underline" href={activity.link}>
                {activity.name}
              </a>
            ) : (
              activity.name
            )}
            <a className="mx-2" href={activity.discordLink}>
              <Discord className="inline h-6 w-6" />
            </a>
            {activity.description}{" "}
            {activity.address ? (
              <a
                target="_blank"
                rel="noreferrer"
                href={getMapsDirections(
                  `${activity.name}, ${activity.address}`,
                )}
                title={
                  activity.walkingDistance
                    ? "Walking directions"
                    : "Bus/Car directions"
                }
              >
                {activity.walkingDistance ? "🚶" : "🚌"}
              </a>
            ) : (
              <span>
                (Location still being determined.{" "}
                <a className="underline" href={activity.discordLink}>
                  Ideas welcome.
                </a>
                )
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="pt-10">
        Note that these don't all have to happen on the 26th. Feel free to get
        together with attendees any time you all are in Utah. We're happy to
        facilitate you getting together any time around the conference time.
      </p>
      <p className="pt-10">
        We'll use{" "}
        <Link className="underline" to="/conf/discord">
          the Discord server
        </Link>{" "}
        to help get people together who want to participate in the same
        activities.{" "}
        <a href="https://discord.com/channels/770287896669978684/935586137752358912">
          Let us know if you have any other ideas!
        </a>
      </p>
    </div>
  );
}
