import { RadioButton } from "primereact/radiobutton";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./Frequency.css";

export default function DepositFrequency({frequency, setFrequency}) {
    return (
        <div className="radio">
            <div className="individual-radio-containers">
                <RadioButton
                inputId="years"
                name="select-frequency"
                value="Annual"
                onChange={(e) => setFrequency(e.value)}
                checked={frequency === "Annual"}
                />
                <label htmlFor="years" className="radiolabel">
                Annual
                </label>
            </div>
            <div className="individual-radio-containers">
                <RadioButton
                inputId="months"
                name="select-frequency"
                value="Monthly"
                onChange={(e) => setFrequency(e.value)}
                checked={frequency === "Monthly"}
                />
                <label htmlFor="months" className="radiolabel">
                Monthly
                </label>
            </div>
            <div className="individual-radio-containers">
                <RadioButton
                inputId="weeks"
                name="select-frequency"
                value="Weekly"
                onChange={(e) => setFrequency(e.value)}
                checked={frequency === "Weekly"}
                />
                <label htmlFor="weeks" className="radiolabel">
                Weekly
                </label>
            </div>
            <div className="individual-radio-containers">
                <RadioButton
                inputId="days"
                name="select-frequency"
                value="Daily"
                onChange={(e) => setFrequency(e.value)}
                checked={frequency === "Daily"}
                />
                <label htmlFor="days" className="radiolabel">
                Daily
                </label>
            </div>
      </div>
      )
}