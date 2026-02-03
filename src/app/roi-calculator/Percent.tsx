import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function Percent({ percent, setPercent }: { percent: number, setPercent: (value: number) => void }) {

  return (
    <div>
      <InputNumber
        placeholder="Enter Amount"
        id="percent"
        suffix="%"
        value={percent}
        onValueChange={(e) => setPercent(e.value ?? 0)}
        mode="decimal"
        min={1}
      />
    </div>
  );
}