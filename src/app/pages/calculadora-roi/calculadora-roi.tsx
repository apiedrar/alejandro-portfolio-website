"use client";
import { useState } from "react";
import { Frequency } from "./Types";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { InputNumber } from "primereact/inputnumber";
import { RadioButton } from "primereact/radiobutton";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./calc.css";

export default function Home() {
  const [initialDeposit, setInitialDeposit] = useState();
  const [contribution, setContribution] = useState();
  const [frequency, setFrequency] = useState<Frequency>("Mensual");
  const [term, setTerm] = useState(5);
  const [percent, setPercent] = useState();
  const isPlural = term > 1 ? "años" : "año";
  const usDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  let roi = 51805;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    e.preventDefault();

  return (
    <main>
      <section className="roi-calculus">
        <form onSubmit={handleSubmit}>
          <div className="bottom-spacing initial-deposit">
            <label htmlFor="initial-deposit" className="spacing toplabel">
              DEPÓSITO INICIAL
            </label>
            <br />
            <InputNumber
              placeholder="US$ 1.200"
              className="spacing"
              id="initial-deposit"
              value={initialDeposit}
              onValueChange={(e) => setInitialDeposit(e.value)}
              mode="decimal"
              prefix="US$ "
              locale="es"
            />
          </div>
          <div>
            <label htmlFor="contributions" className="spacing toplabel">
              APORTES
            </label>
            <br />
            <InputNumber
              placeholder="US$ 200"
              className="spacing contributions-specific"
              id="contributions"
              value={contribution}
              onValueChange={(e) => setContribution(e.value)}
              mode="decimal"
              prefix="US$ "
              locale="es"
            />
            <div className="radio">
              <div className="individual-radio-containers anual-margin-right">
                <RadioButton
                  inputId="years"
                  name="select-frequency"
                  value="Anual"
                  onChange={(e) => setFrequency(e.value)}
                  checked={frequency === "Anual"}
                />
                <label htmlFor="years" className="radiolabel">
                  Anual
                </label>
              </div>
              <div className="individual-radio-containers monthly-margin-left">
                <RadioButton
                  inputId="months"
                  name="select-frequency"
                  value="Mensual"
                  onChange={(e) => setFrequency(e.value)}
                  checked={frequency === "Mensual"}
                />
                <label htmlFor="months" className="radiolabel">
                  Mensual
                </label>
              </div>
              <div className="individual-radio-containers weekly-margin-right">
                <RadioButton
                  inputId="weeks"
                  name="select-frequency"
                  value="Semanal"
                  onChange={(e) => setFrequency(e.value)}
                  checked={frequency === "Semanal"}
                />
                <label htmlFor="weeks" className="radiolabel">
                  Semanal
                </label>
              </div>
              <div className="individual-radio-containers daily-margin-left">
                <RadioButton
                  inputId="days"
                  name="select-frequency"
                  value="Diario"
                  onChange={(e) => setFrequency(e.value)}
                  checked={frequency === "Diario"}
                />
                <label htmlFor="days" className="radiolabel">
                  Diario
                </label>
              </div>
            </div>
          </div>
          <div className="slider-spacing term-of-investment">
            <label htmlFor="pay-term" className="spacing toplabel">
              PLAZO DE INVERSIÓN
            </label>
            <p className="spacing term">{`${term} ${isPlural}`}</p>
            <Slider
              name="pay-term"
              value={term}
              onChange={(e) => setTerm(e.value)}
              className="p-slider p-slider-handle w-300px spacing3"
              min={1}
              max={40}
            />
          </div>
          <div>
            <label htmlFor="percent" className="toplabel">
              RETORNO ANUAL PROMEDIO
            </label>
            <br />
            <InputNumber
              placeholder="15%"
              className="spacing roi-specific"
              id="percent"
              suffix="%"
              value={percent}
              onValueChange={(e) => setPercent(e.value)}
              mode="decimal"
              min={10}
              max={40}
            />
          </div>
          <Button className="bouton" label="Calcular mis rendimientos" />
        </form>
        <div className="result-graph">
          <div className="top-container">
            <label
              htmlFor="return-of-investment"
              className="toplabel potential-balance"
            >
              SALDO POTENCIAL AL TÉRMINO:
            </label>
            <div className="final-result" id="return-of-investment">
              US{usDollar.format(roi)}
            </div>
            <div className="graph"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
