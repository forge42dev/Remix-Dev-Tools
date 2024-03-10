import * as React from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { useLoaderData, Link } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";
import { primaryButtonLinkClass } from "~/ui/buttons";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "Remix Conf Venue",
    description: "Remix Conf in Salt Lake City, Utah at the Sheraton Hotel",
  });
};

const hotelImages = [
  "Sheraton Salt Lake City Hotel building with sign",
  "Sheraton Salt Lake City Hotel building with pool",
  "Large conference room with circular tables set for a meal",
  "Outdoor fire pit surrounded by trees",
  "Bar and seating area",
  "Sheraton Salt Lake City Hotel building with pool at night",
  "Sheraton Hotel lobby with seating area",
  "Mountain range with city at the base",
];
const TOTAL_HOTEL_IMAGES = hotelImages.length;

export const loader = async (_: LoaderFunctionArgs) => {
  return json({
    hotelImageNumber: Math.floor(Math.random() * TOTAL_HOTEL_IMAGES) + 1,
  });
};

const map = (
  <a href="https://g.page/sheraton-salt-lake-city-hotel">
    <img
      src="/conf-images/hotel/sheraton-map.png"
      alt="Sheraton Map"
      title="Sheraton Map"
      className="rounded-md"
    />
  </a>
);

function Title({ className }: { className: string }) {
  return (
    <div className={className}>
      <h1 className="mb-2 font-display text-3xl font-extrabold sm:text-5xl xl:text-7xl">
        Sheraton Salt Lake City Hotel
      </h1>
      <small>
        <a href="https://g.page/sheraton-salt-lake-city-hotel">
          150 West 500 South Salt Lake City, Utah 84101
        </a>
      </small>
    </div>
  );
}

export default function Venue() {
  const data = useLoaderData<typeof loader>();
  const [hotelImageNumber, setHotelImageNumber] = React.useState(
    data.hotelImageNumber,
  );
  return (
    <div className="text-white">
      <div className="mb-10 flex flex-col gap-10 lg:flex-row">
        <Title className="block lg:hidden" />
        <div className="flex flex-col gap-6">
          <button
            onClick={() =>
              setHotelImageNumber((num) => (num % TOTAL_HOTEL_IMAGES) + 1)
            }
          >
            <img
              src={`/conf-images/hotel/${hotelImageNumber}.jpg`}
              alt={hotelImages[hotelImageNumber - 1]}
              style={{ aspectRatio: "16/9" }}
              className="w-full rounded-md object-cover lg:w-96 xl:w-[34rem]"
            />
          </button>
          <div className="w-full text-center">
            <a
              href="https://rmx.as/conf-hotel"
              className={`${primaryButtonLinkClass} font-display font-extrabold uppercase lg:w-full`}
            >
              Book your stay
            </a>
          </div>
          <div className="hidden lg:block lg:w-96 xl:w-[34rem]">{map}</div>
        </div>
        <div className="text-lg lg:text-xl">
          <Title className="hidden lg:block" />
          <div className="mt-4 flex flex-col gap-6">
            <p>
              The conference is held at the base of the beautiful Rocky
              Mountains in the Sheraton Salt Lake City Hotel.
            </p>
            <p>
              In addition to the great ammenities, you'll enjoy the benefits
              that come with a hotel-venue. Don't worry about finding
              transportation to the conference and activities. Hang out with
              other attendees in the lobby and other areas of the hotel as late
              as you please.
            </p>
            <p>
              The hotel is also within walking distance to food, drink, and fun.{" "}
              <Link className="underline" to="/conf/schedule/may-26">
                Activities
              </Link>{" "}
              that we will help you coordinate on our{" "}
              <Link className="underline" to="/conf/discord">
                Discord server
              </Link>
              {"."}
            </p>
            <div className="block lg:hidden">{map}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
