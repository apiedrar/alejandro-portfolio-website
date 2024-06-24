import Image from "next/image";
import Navbar from "./Navbar.jsx";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-stretch">
      <Navbar />
      <div className="w-full justify-center font-mono lg:flex mt-40 mb-12">
        <h2 className="text-xl lg:text-4xl">
          Welcome to my Porfolio Landing Page!
        </h2>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px] lg:mt-8 mb-4">
        <Image
          style={{ borderRadius: "100px" }}
          src="/Alejandro Piedra Rios Web Developer.jpeg"
          alt="Picture of Alejandro. He looks like a professional model! Hashtag cool sunglasses emoji"
          width={200}
          height={200}
          priority
        />
      </div>
      <p className="text-md max-w-[30ch] my-24">
        Below, you'll find examples of my work. Feel free to navigate through
        the site, test and make good use of everything you find interesting.
        <br />
        You're my guest of honor ✨
      </p>

      <div className="mb-5 grid text-center lg:mb-0 lg:w-full lg:max-w-7xl lg:grid-cols-5 lg:text-left lg:place-items-stretch">
        <a
          href="/calculadora-roi"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="/calculadora-roi"
          rel=""
        >
          <h2 className="mb-2 text-2xl font-semibold">
            ROI Calculator{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm opacity-50">
            A simple and intuitive Calculator that shows the power of compound
            interest over time with a graphic! En Español.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Percentage Calculator{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm opacity-50">
            A beautiful user-friendly percentage calculator!
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Mockddit{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm opacity-50">
            A functional mockup of Reddit!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Toggipon{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm opacity-50">
            A simple game based off a beloved franchise, for showcasing purposes
            only.
          </p>
        </a>

        <a
          href="https://www.daniegan.studio"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            My top Indie Project TD{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-balance text-sm opacity-50">
            Take a look at the latest collaboration I'm most proud of (To Date).
          </p>
        </a>
      </div>
    </main>
  );
}
