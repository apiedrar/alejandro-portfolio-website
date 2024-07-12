"use client";
import Navbar from "@/app/Navbar.jsx";
import { useState } from "react";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import InitialDeposit from "./InitialDeposit.jsx";
import Contribution from "./Contribution.jsx";
import DepositFrequency from "./Frequency.jsx";
import Percent from "./Percent.jsx";
import Term from "./Term.jsx";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./CalculadoraRoi.css";

export default function CalculadoraRoi() {
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
      <Navbar />
      <section className="roi-calculus">
        <form onSubmit={handleSubmit}>
          <div className="bottom-spacing initial-deposit">
            <label htmlFor="initial-deposit" className="spacing toplabel">
              INITITAL DEPOSIT
            </label>
            <br />
            <InitialDeposit />
          </div>
          <div>
            <label htmlFor="contributions" className="spacing toplabel">
              CONTRIBUTIONS
            </label>
            <br />
            <Contribution />
            <div>
              <DepositFrequency />
            </div>
          </div>
          <div className="slider-spacing term-of-investment">
            <label htmlFor="pay-term" className="spacing toplabel">
              TERM OF INVESTMENT
            </label>
            <Term />
          </div>
          <div>
            <label className="toplabel">AVERAGE ANNUAL RETURN</label>
            <Percent />
          </div>
          <Button className="bouton" label="Calculate my estimate" />
        </form>
        <div className="result-graph">
          <div className="top-container">
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
      </section>
    </main>
  );
}
