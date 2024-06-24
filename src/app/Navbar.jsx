import Link from "next/link";
import { AiOutline } from "prime-icons/ai";
import { useState } from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const handleNav = () => {
        setMenuOpen(!menuOpen);
    }
    
    return(
        <nav className="fixed w-full h-24 mb-100px">
        <div className="flex justify-between items-center h-full w-full px-4">
          <Link href="https://www.linkedin.com/in/apiedrar/">
            <h1 className="text-2xl lg:text-5xl inline">
              Alejandro Piedra Rios
            </h1>
          </Link>
          <div>
            <ul className="hidden sm:flex inline">
              <Link href="">
                <li className="text-xl">About Me</li>
              </Link>
              <Link href="">
                <li className=" text-xl">Check on GitHub</li>
              </Link>
            </ul>
          </div>
          <div>
            <AiOutlineMenu size={25} />
          </div>
        </div>
      </nav>
    )
}