import type { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Conf Code of Conduct" },
    { description: "Adapted from confcodeofconduct.com" },
  ];
};

export default function CoC() {
  return (
    <InnerLayout>
      <div className="text-white">
        <h1 className="mb-16 font-display text-3xl font-extrabold sm:text-5xl xl:text-7xl">
          Remix Conf Code of Conduct
        </h1>
        <div className="container mb-6 flex flex-col gap-4 text-lg lg:text-xl">
          <p>
            All attendees, speakers, sponsors and volunteers at our conference
            are required to agree with the following code of conduct. Organizers
            will enforce this code throughout the event. We are expecting
            cooperation from all participants to help ensuring a safe
            environment for everybody.
          </p>

          <div className="mb-8">
            <h2 className="sm:tsxt-d-h2 mb-2 text-2xl">The Quick Version</h2>

            <div className="container flex flex-col gap-4 text-sm lg:text-base">
              <p>
                Our conference is dedicated to providing a harassment-free
                conference experience for everyone, regardless of gender, gender
                identity and expression, age, sexual orientation, disability,
                physical appearance, body size, race, ethnicity, religion (or
                lack thereof), or technology choices. We do not tolerate
                harassment of conference participants in any form. Sexual
                language and imagery is not appropriate for any conference
                venue, including talks, workshops, parties, Twitter and other
                online media. Conference participants violating these rules may
                be sanctioned or expelled from the conference{" "}
                <em>without a refund</em> at the discretion of the conference
                organizers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="sm:tsxt-d-h2 mb-2 text-2xl">
              The Less Quick Version
            </h2>

            <div className="container flex flex-col gap-4 text-sm lg:text-base">
              <p>
                Harassment includes offensive verbal comments related to gender,
                gender identity and expression, age, sexual orientation,
                disability, physical appearance, body size, race, ethnicity,
                religion, technology choices, sexual images in public spaces,
                deliberate intimidation, stalking, following, harassing
                photography or recording, sustained disruption of talks or other
                events, inappropriate physical contact, and unwelcome sexual
                attention.
              </p>

              <p>
                Participants asked to stop any harassing behavior are expected
                to comply immediately.
              </p>

              <p>
                Sponsors are also subject to the anti-harassment policy. In
                particular, sponsors should not use sexualized images,
                activities, or other material. Booth staff (including
                volunteers) should not use sexualized
                clothing/uniforms/costumes, or otherwise create a sexualized
                environment.
              </p>

              <p>
                If a participant engages in harassing behavior, the conference
                organizers may take any action they deem appropriate, including
                warning the offender or expulsion from the conference with no
                refund.
              </p>

              <p>
                If you are being harassed, notice that someone else is being
                harassed, or have any other concerns, please contact a member of
                conference staff immediately. Conference staff can be identified
                as they&#39;ll be wearing branded t-shirts. Or email{" "}
                <a className="underline" href="mailto:conf+coc@remix.run">
                  conf+coc@remix.run
                </a>
                .
              </p>

              <p>
                Conference staff will be happy to help participants contact
                hotel/venue security or local law enforcement, provide escorts,
                or otherwise assist those experiencing harassment to feel safe
                for the duration of the conference. We value your attendance.
              </p>

              <p>
                We expect participants to follow these rules at conference and
                workshop venues and conference-related social events.
              </p>
            </div>
          </div>
        </div>
        <div>
          Adapted from{" "}
          <a className="underline" href="https://confcodeofconduct.com">
            confcodeofconduct.com
          </a>
          .
        </div>
      </div>
    </InnerLayout>
  );
}

function InnerLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="my-8 md:my-12 xl:my-14">
      <div className="container">{children}</div>
    </div>
  );
}
