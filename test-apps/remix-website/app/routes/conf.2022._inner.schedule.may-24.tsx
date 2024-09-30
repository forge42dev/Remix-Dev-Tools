import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export const meta: MetaFunction = (args) => {
  return metaV1(args, {
    title: "May 24th at Remix Conf",
    description: "May 24th is The Workshop and Welcome day at Remix.",
  });
};

export default function May24Schedule() {
  return (
    <div>
      <p>
        This is the day before the big event. We'll be holding two{" "}
        <Link className="underline" to="/conf/workshops">
          workshops
        </Link>{" "}
        as well as a welcome reception, both at the{" "}
        <Link className="underline" to="/conf/venue">
          Venue
        </Link>
        . Come hang out with fellow Remix attendees, grab a snack, and get
        registered to avoid the morning lines!{" "}
        <a href="https://rmx.as/tickets" className="underline">
          Join us!
        </a>
      </p>
      <table className="mt-10 w-full border-collapse">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-3">10:00am - 4:00pm</td>
            <td className="border p-3">
              <Link className="underline" to="/conf/workshops">
                Workshops
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-3">6:00pm - 9:00pm</td>
            <td className="border p-3">Welcome Reception</td>
          </tr>
          <tr>
            <td className="border p-3">6:00pm - 9:00pm</td>
            <td className="border p-3">
              "Hack && Hang" with Cockroach Labs and Netlify
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-10">
        <small>
          During the welcome reception, we will be recording the talks of all
          backup speakers. We're still deciding whether you'll be invited to
          attend those talks, but you'll definitely be able to watch them after
          the conference!
        </small>
      </div>
    </div>
  );
}
