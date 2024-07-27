import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function InitialDeposit ({initialDeposit, setInitialDeposit}) {

    return (<InputNumber
        placeholder="US$ 1,200"
        id="initial-deposit"
        value={initialDeposit}
        onValueChange={(e) => setInitialDeposit(e.value)}
        mode="decimal"
        prefix="US$ "
        locale="en-us"
        min={10}
      />)
}