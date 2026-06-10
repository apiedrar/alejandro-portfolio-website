import { InputNumber } from "primereact/inputnumber";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";

export default function Percent({ percent, setPercent }: { percent: number | null, setPercent: (value: number) => void }) {

  return (
    <div>
      <InputNumber
        placeholder="Enter Percentage"
        id="percent"
        suffix="%"
        value={percent}
        onValueChange={(e) => setPercent(e.value ?? 0)}
        mode="decimal"
        min={2}
        max={130}
      />
    </div>
  );
}