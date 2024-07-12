import { useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function Percent() {
    const [percent, setPercent] = useState();
    
    return (
        <div>
            <InputNumber
              placeholder="15%"
              id="percent"
              suffix="%"
              value={percent}
              onValueChange={(e) => setPercent(e.value)}
              mode="decimal"
              min={10}
              max={40}
            />
          </div>
    );
}