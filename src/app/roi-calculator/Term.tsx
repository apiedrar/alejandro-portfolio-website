import { Slider } from "primereact/slider";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./Term.css";

export default function Term({ term, setTerm }: { term: number, setTerm: (value: number) => void }) {
    const isPlural = term > 1 ? "years" : "year";

    return (
        <div>
            <p className="spacing term">{`${term} ${isPlural}`}</p>
            <Slider
                name="pay-term"
                value={term}
                onChange={(e) => setTerm(e.value as number)}
                className="p-slider p-slider-handle w-300px"
                min={1}
                max={65}
            />
        </div>
    )
}