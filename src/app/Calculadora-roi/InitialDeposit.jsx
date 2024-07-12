import { useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function InitialDeposit () {
    const [initialDeposit, setInitialDeposit] = useState(null);

    return (<InputNumber
        placeholder="US$ 1,200"
        id="initial-deposit"
        value={initialDeposit}
        onValueChange={(e) => setInitialDeposit(e.value)}
        mode="decimal"
        prefix="US$ "
        locale="en"
      />)
}