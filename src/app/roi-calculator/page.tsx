"use client";
import Navbar from "@/app/Navbar.jsx";
import { useState } from "react";
import { Button } from "primereact/button";
import InitialDeposit from "./InitialDeposit.jsx";
import Contribution from "./Contribution.jsx";
import DepositFrequency from "./Frequency.jsx";
import Percent from "./Percent.jsx";
import Term from "./Term.jsx";
import {
  handleSubmit,
  calculateInvestedAmount,
  calculateReturnAmount,
  calculateReinvestedReturn,
  calculateFutureBalance,
} from "./utils.js";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./RoiCalculator.css";

export default function RoiCalculator() {
  const [initialDeposit, setInitialDeposit] = useState(null);
  const [contribution, setContribution] = useState(null);
  const [frequency, setFrequency] = useState("Monthly");
  const [term, setTerm] = useState(5);
  const [percent, setPercent] = useState(null);
  const usDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const submition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = { initialDeposit, contribution, frequency, term, percent };

    const investedAmounts = calculateInvestedAmount(
      initialDeposit,
      contribution,
      frequency,
      term
    );
    const returnAmounts = calculateReturnAmount(investedAmounts, percent);
    const reinvestedReturns = calculateReinvestedReturn(returnAmounts, percent);
    const futureBalance = calculateFutureBalance(
      investedAmounts,
      reinvestedReturns
    );

    handleSubmit({ formData });

    return futureBalance;
  };
  let roi = 20244;

  return (
    <main>
      <Navbar />
      <section className="calculator-top-container">
        <div className="roi-calculus">
          <form onSubmit={submition}>
            <div className="bottom-spacing initial-deposit">
              <label
                htmlFor="initial-deposit"
                className="block spacing toplabel"
              >
                INITITAL DEPOSIT
              </label>
              <InitialDeposit
                initialDeposit={initialDeposit}
                setInitialDeposit={setInitialDeposit}
              />
            </div>
            <div className="bottom-spacing">
              <label htmlFor="contributions" className="block spacing toplabel">
                CONTRIBUTIONS
              </label>
              <Contribution
                contribution={contribution}
                setContribution={setContribution}
              />
            </div>
            <div>
              <DepositFrequency
                frequency={frequency}
                setFrequency={setFrequency}
              />
            </div>
            <div className="slider-spacing">
              <label htmlFor="pay-term" className="block spacing toplabel">
                TERM OF INVESTMENT
              </label>
              <Term term={term} setTerm={setTerm} />
            </div>
            <div className="average-return">
              <label className="block spacing toplabel">
                AVERAGE ANNUAL RETURN
              </label>
              <Percent percent={percent} setPercent={setPercent} />
            </div>
            <Button
              type="submit"
              className="block bouton"
              label="Calculate my estimate"
            />
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
