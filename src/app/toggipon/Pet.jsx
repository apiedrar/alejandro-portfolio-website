import Image from "next/image";

export default function Pet({playersPet, setPlayersPet, petName, petTag}) {
    return (
        <div className="my-[5%] mx-[5%] border rounded-full p-[10%]">
            <input className="hidden" type="radio" id={petTag} value={petName} onChange={(e) => setPlayersPet(e.value)} checked={playersPet === petName} />
            <label className="inline-flex" htmlFor={petTag}>
            {petName}
            <Image className="w-[35%] ml-[10%]" src={`/${petName}.png`} alt={petName} width={150} height={150} />
            </label>
        </div>
    )
}