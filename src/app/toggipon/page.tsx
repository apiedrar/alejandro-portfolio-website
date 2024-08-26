"use client";
import Navbar from "@/app/Navbar.jsx";
import { useState } from "react";
import Pet from "./Pet.jsx";
import "./Toggipon.css";

export default function Toggipon() {
  const [game, setGame] = useState(["Player", "Machine"]);
  const [playersPet, setPlayersPet] = useState("Hipodoge");

  return (
    <main>
      <section className="grid-cols-2 grid-rows-3">
        <Pet playersPet={playersPet} setPlayersPet={setPlayersPet} />
        <Pet playersPet={playersPet} setPlayersPet={setPlayersPet} />
        <Pet playersPet={playersPet} setPlayersPet={setPlayersPet} />
        <Pet playersPet={playersPet} setPlayersPet={setPlayersPet} />
        <Pet playersPet={playersPet} setPlayersPet={setPlayersPet} />
        <Pet playersPet={playersPet} setPlayersPet={setPlayersPet} />
      </section>
    </main>
  );
}
