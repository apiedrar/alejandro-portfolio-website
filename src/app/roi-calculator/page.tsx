"use client";
import Navbar from "@/app/Navbar.jsx";
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
import InitialDeposit from "./InitialDeposit.jsx";
import Contribution from "./Contribution.jsx";
import DepositFrequency from "./Frequency.jsx";
import Percent from "./Percent.jsx";
import Term from "./Term.jsx";
import { handleSubmit } from "./utils.js";
import "primereact/resources/themes/mira/theme.css";
import "primeflex/primeflex.css";
import "./RoiCalculator.css";

export default function RoiCalculator() {
  const [initialDeposit, setInitialDeposit] = useState(null);
  const [contribution, setContribution] = useState(null);
  const [frequency, setFrequency] = useState("Monthly");
  const [term, setTerm] = useState(5);
  const [percent, setPercent] = useState(null);
  const [graphData, setGraphData] = useState<Array<any>>([]);
  const [futureBalance, setFutureBalance] = useState(0);
  const usDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const submition = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = { initialDeposit, contribution, frequency, term, percent };

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
                <ResponsiveContainer width="98%" height="90%">
                  <BarChart
                    data={graphData}
                    margin={{ top: 50, right: 15, bottom: 0, left: 15 }}
                  >
                    <Bar
                      name="Investment"
                      dataKey="investedAmount"
                      fill="#c8d8fa"
                      stackId="a"
                    />
                    <Bar
                      name="Return"
                      dataKey="returnAmount"
                      fill="#92b1f5"
                      stackId="a"
                    />
                    <CartesianGrid stroke="#c8d8fa" vertical={false} />
                    <XAxis stroke="#c8d8fa" dataKey="year" />
                    <YAxis type="number" stroke="#c8d8fa" />
                    <Tooltip cursor={false} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <section className="legend-container">
              <div className="legend">
                {futureBalance !== 0 ? (
                  <p>
                    As you can see, the bars represent both your investment and
                    the returns generated.
                    <br /> You may be wondering why your returns look so small,
                    right&#63; Well, that is because the idea of interest
                    compounding over time means consistently reinvesting your
                    returns along with your Initial Deposit and your
                    Contributions. To put it simply&#58; if you invest according
                    to the values I&#39;ve left for you as placeholders, at the
                    end of the term you&#39;ll have payed US&#36; 13,200.
                    Substract that from your Potential Future Balance and you'll
                    have your Potential Total Return of Investment.
                  </p>
                ) : (
                  <p>
                    Welcome&#33; This is a Compound Interest Calculator.
                    <br />
                    To start using it, enter sums in Initial Deposit&#39;s and
                    Contribution&#39;s inputs; and a quantity in the Average
                    Annual Return input at the bottom. You may modify the
                    Contribution frequency and the Term of Investment, or leave
                    them as they&#39;re set by default.
                    <br />
                    When you&#39;re done, click the button or hit enter.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
