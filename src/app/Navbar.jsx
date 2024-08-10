import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { ArrowUpRightIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleNav = () => {
        setMenuOpen(!menuOpen);
    }

    return(
      <nav className="fixed z-40 w-screen h-24 mb-100px bg-[#dbdfe0] dark:bg-black">
        <div className="flex justify-between items-center h-full w-full px-4">
          <Link href="/">
            <h1 className="text-lg md:text-2xl lg:text-5xl inline">
              Alejandro Piedra Rios
            </h1>
          </Link>
          <div className="hidden md:flex">
            <ul className="hidden md:flex">
              <Link href="https://www.linkedin.com/in/apiedrar/" target="_blank">
                <li className="ml-5 hover:border p-4 text-lg md:text-xl">Contact Me</li>
              </Link>
              <Link href="https://www.github.com/apiedrar/apr-portfolio-web" target="_blank">
                <li className="mx-5 hover:border p-4 text-lg md:text-xl">View on GitHub <ArrowUpRightIcon className="size-6 inline" /></li>
              </Link>
            </ul>
          </div>
          <div onClick={toggleNav} className="md:hidden cursor-pointer pl-24"><Bars3Icon className="size-7" />
          </div>
          <div className={menuOpen ? "fixed z-40 top-0 left-0 w-screen md:hidden h-[32%] bg-[#dbdfe0] p-10 ease-in duration-500 dark:bg-black" : "fixed z-40 top-[-100%] left-0 p-10 ease-in duration-500"}>
            <div className="flex w-full items-center justify-end">
              <div onClick={toggleNav} className="cursor-pointer">
                <XMarkIcon className="size-7"/>
              </div>
            </div>
            <div className="flex-col py-4">
                <ul>
              <Link href="https://www.linkedin.com/in/apiedrar/" target="_blank">
                <li className="py-4 cursor-pointer">Contact Me</li>
              </Link>
              <Link href="https://www.github.com/apiedrar/alejandro-portfolio-website" target="_blank">
                <li className="py-4 cursor-pointer">View on GitHub <ArrowUpRightIcon className="size-6 inline" /></li>
                </Link>
                </ul>
            </div>
          </div>
        </div>
      </nav>
    )
}