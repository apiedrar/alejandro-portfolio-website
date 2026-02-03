import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function Contribution({ contribution, setContribution }: { contribution: number, setContribution: (value: number) => void }) {

    return (
        <InputNumber
            placeholder="Enter Amount"
            id="contributions"
            value={contribution}
            onValueChange={(e) => setContribution(e.value ?? 0)}
            mode="decimal"
            prefix="US$ "
            locale="en-us"
            min={1}
        />
    )
}