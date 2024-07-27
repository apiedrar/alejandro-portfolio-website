import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function Contribution ({contribution, setContribution}) {

    return (
        <InputNumber
            placeholder="US$ 200"
            id="contributions"
            value={contribution}
            onValueChange={(e) => setContribution(e.value)}
            mode="decimal"
            prefix="US$ "
            locale="en-us"
            min={10}
        />
    )
}