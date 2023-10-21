import { Icon } from "~/components/icon";
import atticusAndMe from "~/images/atticus-and-me.png";

export default function Links() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-blue-950 px-4 py-8 text-white md:px-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 md:max-w-4xl md:flex-row md:justify-evenly md:gap-8">
        <header className="md:basis-1/2">
          <figure className="min-h-fit w-3/4 min-w-fit sm:w-48 md:w-3/4">
            <div className="mx-auto aspect-square w-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500 p-1 shadow-sm">
              <img
                alt="Atticus and Me"
                className="aspect-square h-full rounded-full object-cover"
                src={atticusAndMe}
              />
            </div>
          </figure>
          <div className="text-center">
            <h1 className="mx-auto max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              Aydrian Howard
            </h1>
            <h2 className="text-2xl font-semibold md:text-4xl">
              Hoosier in the Big City
            </h2>
            <h3 className="text-base font-light md:text-xl">
              Corgi Dad · Uncle · Nerd
            </h3>
          </div>
        </header>
        <nav className="flex w-full flex-col gap-4 text-center text-lg sm:w-fit md:basis-1/2">
          <a
            className="flex items-center justify-between gap-2 rounded-sm border border-green-500 p-4 font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500"
            href="https://itsaydrian.com"
          >
            <Icon className="h-6 w-6" name="home" />
            <div className="grow text-center">ItsAydrian.com</div>
          </a>
          <a
            className="flex items-center justify-between gap-2 rounded-sm border border-green-500 p-4 font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500"
            href="https://twitter.com/itsaydrian"
          >
            <Icon className="h-6 w-6" name="twitter" />
            <div className="grow text-center">Twitter</div>
          </a>
          <a
            className="flex items-center justify-between gap-2 rounded-sm border border-green-500 p-4 font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500"
            href="https://instagram.com/itsaydrian"
          >
            <Icon className="h-6 w-6" name="instagram" />
            <div className="grow text-center">Instagram</div>
          </a>
          <a
            className="flex items-center justify-between gap-2 rounded-sm border border-green-500 p-4 font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500"
            href="https://twitch.com/itsaydrian"
          >
            <Icon className="h-6 w-6" name="twitch" />
            <div className="grow text-center">Twitch</div>
          </a>
          <a
            className="flex items-center justify-between gap-2 rounded-sm border border-green-500 p-4 font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500"
            href="https://github.com/aydrian"
          >
            <Icon className="h-6 w-6" name="github" />
            <div className="grow text-center">GitHub</div>
          </a>
          <a
            className="flex items-center justify-between gap-2 rounded-sm border border-green-500 p-4 font-medium hover:bg-gradient-to-r hover:from-cyan-500 hover:to-green-500"
            href="https://www.linkedin.com/in/aydrian/"
          >
            <Icon className="h-6 w-6" name="linkedin" />
            <div className="grow text-center">LinkedIn</div>
          </a>
        </nav>
      </div>
    </div>
  );
}
