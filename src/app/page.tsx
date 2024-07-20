"use client";
import Image from "next/image";
import Navbar from "./Navbar.jsx";
import Link from "next/link.js";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-stretch">
      <Navbar />
      <div className="max-w-[240px] justify-center font-mono mt-40 mb-12 lg:flex lg:max-w-full">
        <h2 className="text-lg lg:text-4xl">Welcome to my Website!</h2>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:from-transparent before:to-blue-700 before:opacity-10 after:absolute after:-z-20 after:h-[160px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-900 after:via-[#0141ff] after:blur-2xl after:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px] lg:mt-8 mb-4">
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
        Below, I'll be publishing examples of my work. Feel free to navigate
        through the site, test and make good use of everything you find
        interesting.
        <br />
        You're my guest of honor ✨
      </p>

      <div className="mb-5 grid text-center lg:mb-0 lg:w-full lg:max-w-7xl lg:grid-cols-5 lg:text-left lg:place-items-stretch">
        <Link
          href="/roi-calculator"
          className="hidden group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Investment ROI Calculator{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm">
            Compound Interest Calculator, with a Graphic and built using Next.js
            and Primereact.
          </p>
        </Link>

        <Link
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="hidden group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Percentage Calculator{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm">
            Beautiful, user-friendly percentage calculator! Built emulating MVC
            Architecture.
          </p>
        </Link>

        <Link
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="hidden group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Mockddit Phone Home{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm">
            Built using React and Redux, and integrating real data from Reddit's
            API.
          </p>
        </Link>

        <Link
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="hidden group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Duel Against the Machine{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-sm">
            A simple game based off of a beloved franchise! Built in old
            fashioned HTML, CSS and JavaScript.
          </p>
        </Link>

        <Link
          href="https://www.daniegan.studio"
          className="hidden group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-2 text-2xl font-semibold">
            Top Indie Project TD{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="mt-2 max-w-[30ch] text-balance text-sm">
            Take a look at the latest collaboration I'm most proud of (To Date).
          </p>
        </Link>
      </div>
    </main>
  );
}
