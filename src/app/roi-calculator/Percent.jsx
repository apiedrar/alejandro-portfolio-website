import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function Percent({percent, setPercent}) {
    
    return (
        <div>
            <InputNumber
              placeholder="Enter Amount"
              id="percent"
              suffix="%"
              value={percent}
              onValueChange={(e) => setPercent(e.value)}
              mode="decimal"
              min={1}
            />
          </div>
    );
}