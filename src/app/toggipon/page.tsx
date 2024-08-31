"use client";
import Navbar from "@/app/Navbar.jsx";
import { useState } from "react";
import Pet from "./Pet.jsx";
import "./Toggipon.css";

export default function Toggipon() {
  const [game, setGame] = useState(["Player", "Machine"]);
  const [playersPet, setPlayersPet] = useState("Hipodoge");

  return (
    <main className="flex flex-col justify-center align-center">
      <h1 className="self-center my-[5%]">T O G G I P O N !</h1>
      <div className="flex justify-center align-center">
        <section className="flex flex-col justify-center align-center">
          <h2 className="my-[10%] self-center">Choose your Pet:</h2>
          <div className="grid grid-cols-1 grid-rows-6 md:grid-cols-2 md:grid-rows-3">
            <Pet
              playersPet={playersPet}
              setPlayersPet={setPlayersPet}
              petName="Hipodoge"
              petTag="hipodoge"
            />
            <Pet
              playersPet={playersPet}
              setPlayersPet={setPlayersPet}
              petName="Capipepo"
              petTag="capipepo"
            />
            <Pet
              playersPet={playersPet}
              setPlayersPet={setPlayersPet}
              petName="Ratigueya"
              petTag="ratigueya"
            />
            <Pet
              playersPet={playersPet}
              setPlayersPet={setPlayersPet}
              petName="Langostelvis"
              petTag="langostelvis"
            />
            <Pet
              playersPet={playersPet}
              setPlayersPet={setPlayersPet}
              petName="Tucapalma"
              petTag="tucapalma"
            />
            <Pet
              playersPet={playersPet}
              setPlayersPet={setPlayersPet}
              petName="Pydos"
              petTag="pydos"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
