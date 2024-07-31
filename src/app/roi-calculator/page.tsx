"use client";
import Navbar from "@/app/Navbar.jsx";
import { Button } from "primereact/button";
import InitialDeposit from "./InitialDeposit.jsx";
import Contribution from "./Contribution.jsx";
import DepositFrequency from "./Frequency.jsx";
import Percent from "./Percent.jsx";
import Term from "./Term.jsx";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./RoiCalculator.css";

export default function CalculadoraRoi() {
  const usDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  let roi = 20244;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    e.preventDefault();

  return (
    <main>
      <Navbar />
      <section className="calculator-top-container">
        <div className="roi-calculus">
          <form onSubmit={handleSubmit}>
            <div className="bottom-spacing initial-deposit">
              <label
                htmlFor="initial-deposit"
                className="block spacing toplabel"
              >
                INITITAL DEPOSIT
              </label>
              <InitialDeposit />
            </div>
            <div className="bottom-spacing">
              <label htmlFor="contributions" className="block spacing toplabel">
                CONTRIBUTIONS
              </label>
              <Contribution />
            </div>
            <div>
              <DepositFrequency />
            </div>
            <div className="slider-spacing">
              <label htmlFor="pay-term" className="block spacing toplabel">
                TERM OF INVESTMENT
              </label>
              <Term />
            </div>
            <div className="wololo">
              <label className="block toplabel">AVERAGE ANNUAL RETURN</label>
              <Percent />
            </div>
            <Button className="block bouton" label="Calculate my estimate" />
          </form>
          <div className="result-graph">
            <div className="graph-top-container">
              <label
                htmlFor="return-of-investment"
                className="toplabel potential-balance"
              >
                POTENTIAL FUTURE BALANCE:
              </label>
              <div className="final-result" id="return-of-investment">
                US{usDollar.format(roi)}
              </div>
              <div className="graph"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
