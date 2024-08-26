import Image from "next/image";

export default function Pet({playersPet, setPlayersPet}) {
    return (
        <div>
            <input className="hidden" type="radio" id="hipodoge" value={"Hipodoge"} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === "Hipodoge"}>
                <label htmlFor="hipodoge">
                Hipodoge
                <Image className="w-[20px]" src="/Hipodoge.png" alt="Hipodoge" />
                </label>
            </input>
            <input className="hidden" type="radio" id="ratigueya" value={"Ratigueya"} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === "Ratigueya"}>
                <label htmlFor="ratigueya">
                Ratigueya
                <Image className="w-[20px]" src="/Ratigueya.png" alt="Ratigueya" />
                </label>
            </input>
            <input className="hidden" type="radio" id="capipepo" value={"Capipepo"} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === "Capipepo"}>
                <label htmlFor="capipepo">
                Capipepo
                <Image className="w-[20px]" src="/Capipepo.png" alt="Capipepo" />
                </label>
            </input>
            <input className="hidden" type="radio" id="tucapalma" value={"Tucapalma"} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === "Tucapalma"}>
                <label htmlFor="tucapalma">
                Tucapalma
                <Image className="w-[20px]" src="/Tucapalma.png" alt="Tucapalma" />
                </label>
            </input>
            <input className="hidden" type="radio" id="langostelvis" value={"Langostelvis"} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === "Langostelvis"}>
                <label htmlFor="langostelvis">
                Langostelvis
                <Image className="w-[20px]" src="/Langostelvis.png" alt="Langostelvis" />
                </label>
            </input>
            <input className="hidden" type="radio" id="pydos" value={"Pydos"} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === "Pydos"}>
                <label htmlFor="pydos">
                Pydos
                <Image className="w-[20px]" src="/Pydos.png" alt="Pydos" />
                </label>
            </input>
        </div>
    )
}