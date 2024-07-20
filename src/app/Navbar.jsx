import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { ArrowUpRightIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const handleNav = () => {
        setMenuOpen(!menuOpen);
    }

    return(
      <nav className="fixed w-screen h-24 mb-100px bg-black">
        <div className="flex justify-between items-center h-full w-full px-4">
          <Link href="/">
            <h1 className="text-lg lg:text-5xl inline">
              Alejandro Piedra Rios
            </h1>
          </Link>
          <div className="hidden sm:flex">
            <ul className="hidden sm:flex">
              <Link href="https://www.linkedin.com/in/apiedrar/">
                <li className="ml-5 hover:border p-4 text-xl">Contact Me</li>
              </Link>
              <Link href="https://www.github.com/apiedrar/apr-portfolio-web">
                <li className="mx-5 hover:border p-4 text-xl">View on GitHub <ArrowUpRightIcon className="size-6 text-gray-500 inline" /></li>
              </Link>
            </ul>
          </div>
          <div onClick={handleNav} className="sm:hidden cursor-pointer pl-24"><Bars3Icon className="size-7 text-gray-500" />
          </div>
          <div className={menuOpen ? "fixed top-0 left-0 w-screen sm:hidden h-[28%] bg-black p-10 ease-in duration-500" : "fixed top-[-100%] left-0 p-10 ease-in duration-500"}>
            <div className="flex w-full items-center justify-end">
              <div onClick={handleNav} className="cursor-pointer">
                <XMarkIcon className="size-7 text-gray-500"/>
              </div>
            </div>
            <div className="flex-col py-4">
                <ul>
              <Link href="https://www.x.com/apiedrar/">
                <li className="py-4 cursor-pointer">About Me</li>
              </Link>
              <Link href="https://www.github.com/apiedrar/apr-portfolio-web">
                <li className="py-4 cursor-pointer">Check on GitHub</li>
                </Link>
                </ul>
            </div>
          </div>
        </div>
      </nav>
    )
}