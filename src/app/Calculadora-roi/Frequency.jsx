import { useState } from "react";
import { RadioButton } from "primereact/radiobutton";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./Frequency.css";

export default function DepositFrequency () {
    const [frequency, setFrequency] = useState("Mensual");

    return (
        <div className="radio">
        <div className="individual-radio-containers">
            <RadioButton
            inputId="years"
            name="select-frequency"
            value="Anual"
            onChange={(e) => setFrequency(e.value)}
            checked={frequency === "Anual"}
            />
            <label htmlFor="years" className="radiolabel">
            Annual
            </label>
        </div>
        <div className="individual-radio-containers">
            <RadioButton
            inputId="months"
            name="select-frequency"
            value="Mensual"
            onChange={(e) => setFrequency(e.value)}
            checked={frequency === "Mensual"}
            />
            <label htmlFor="months" className="radiolabel">
            Monthly
            </label>
        </div>
        <div className="individual-radio-containers">
            <RadioButton
            inputId="weeks"
            name="select-frequency"
            value="Semanal"
            onChange={(e) => setFrequency(e.value)}
            checked={frequency === "Semanal"}
            />
            <label htmlFor="weeks" className="radiolabel">
            Weekly
            </label>
        </div>
        <div className="individual-radio-containers">
            <RadioButton
            inputId="days"
            name="select-frequency"
            value="Diario"
            onChange={(e) => setFrequency(e.value)}
            checked={frequency === "Diario"}
            />
            <label htmlFor="days" className="radiolabel">
            Daily
            </label>
        </div>
      </div>
      )
}