"use client";
import Image from "next/image";
import Navbar from "./Navbar.jsx";
import Link from "next/link.js";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-stretch">
      <Navbar />
      <div className="max-w-[240px] justify-center font-mono mt-52 mb-12 lg:flex lg:max-w-full">
        <h2 className="text-lg lg:text-4xl">Welcome to my Website!</h2>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[800px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-[#cabfdb] before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[400px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-[#624094] after:via-[#472083] after:blur-2xl after:content-[''] after:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <Image
          style={{ borderRadius: "100px" }}
          src="/Alejandro Piedra Rios Web Developer.jpeg"
          alt="Picture of Alejandro. He looks like a professional model! Hashtag cool sunglasses emoji"
          width={200}
          height={200}
          priority
        />
      </div>
      <div className="text-md max-w-[50ch] w-[90%] my-24">
        <p>Below, I&#39;ll be adding features to showcase my skills.</p>
        <br />
        <p>
          Feel free to navigate through the site, test and make good use of
          everything you find interesting.
        </p>
        <br />
        <h4>
          <b>You&#39;re my guest of honor</b> ✨
        </h4>
      </div>

      <div className="mb-5 grid text-center max-w-[60ch] lg:text-left">
        <Link
          href="/roi-calculator"
          className="rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            ROI Calculator{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[90%] text-sm">
            Enter the amounts and simulate how the interest would compound over
            time by periodically reinvesting your returns as well as the money
            you&#39;re investing.
          </p>
        </Link>
      </div>
    </main>
  );
}
