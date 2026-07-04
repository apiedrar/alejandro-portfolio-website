"use client";
import Navbar from "@/app/Navbar";
import { useState } from "react";
import { Button } from "primereact/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import InitialDeposit from "./InitialDeposit";
import Contribution from "./Contribution";
import DepositFrequency from "./Frequency";
import Percent from "./Percent";
import Term from "./Term";
import { handleSubmit } from "./utils";
import type { GraphDataPoint, Frequency } from "./utils";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./RoiCalculator.css";

export default function RoiCalculator() {
  const [initialDeposit, setInitialDeposit] = useState<number | null>(null);
  const [contribution, setContribution] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [term, setTerm] = useState<number>(1);
  const [percent, setPercent] = useState<number | null>(null);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [futureBalance, setFutureBalance] = useState(0);
  const usDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const submition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (initialDeposit === null || contribution === null || percent === null) return;

    const formData = {
      initialDeposit,
      contribution,
      frequency: frequency as Frequency,
      term,
      percent,
    };

    const { graphData, futureBalance } = handleSubmit({ formData });

    setGraphData(graphData);
    setFutureBalance(futureBalance);
  };

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
                US{usDollar.format(futureBalance)}
              </div>
              <div className="graph">
                <ResponsiveContainer width={"98%"} height={"90%"}>
                  <BarChart
                    data={graphData}
                    margin={{ top: 50, right: 15, bottom: 0, left: 15 }}
                  >
                    <Bar
                      name="Investment"
                      dataKey="investedAmount"
                      fill="#cabfdb"
                      stackId="a"
                    />
                    <Bar
                      name="Return"
                      dataKey="returnAmount"
                      fill="#9680b8"
                      stackId="a"
                    />
                    <CartesianGrid stroke="#cabfdb" vertical={false} />
                    <XAxis stroke="#cabfdb" dataKey="year" />
                    <YAxis type="number" stroke="#cabfdb" />
                    <Tooltip cursor={{ stroke: "#cabfdb", opacity: "20%" }} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
