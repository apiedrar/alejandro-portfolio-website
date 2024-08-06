import { addDays, addWeeks, addMonths, addYears, startOfDay } from "date-fns";

const calculateStartDate = (frequency) => {
  const today = startOfDay(new Date());

  switch (frequency) {
    case "Daily":
      return addDays(today, 1);
    case "Weekly":
      return addWeeks(today, 1);
    case "Monthly":
      return addMonths(today, 1);
    case "Annual":
      return addYears(today, 1);
  }
};

const calculateInvestedAmount = (
  initialDeposit,
  contribution,
  frequency,
  term
) => {
  const frequencyMap = {
    Daily: 365,
    Weekly: 52,
    Monthly: 12,
    Annual: 1,
  };

  const contributionSpans = frequencyMap[frequency];
  const annualContribution = contribution * contributionSpans;

  const investedAmounts = [];
  for (let i = 0; i <= term; i++) {
    investedAmounts.push(initialDeposit + annualContribution * i);
  }
  return investedAmounts;
};

const calculateReturnAmount = (investedAmounts, percent) => {
  const annualReturnRate = percent / 100;
  const returnAmounts = [0];

  for (let i = 1; i < investedAmounts.length; i++) {
    const previousAmount = investedAmounts[i - 1] + returnAmounts[i - 1];
    const currentAmount = investedAmounts[i] - investedAmounts[i - 1];
    returnAmounts.push(
      Math.round(
        previousAmount * annualReturnRate + currentAmount * annualReturnRate
      )
    );
  }

  return returnAmounts;
};

const calculateFutureBalance = (investedAmounts, returnAmounts) => {
  const totalInvested = investedAmounts.reduce(
    (acc, investedAmount) => acc + investedAmount,
    0
  );
  const totalReturns = returnAmounts.reduce(
    (acc, returnAmount) => acc + returnAmount,
    0
  );
  return Math.round(totalInvested + totalReturns);
};

const handleSubmit = ({ formData }) => {
  const { initialDeposit, contribution, frequency, term, percent } = formData;

  const investedAmounts = calculateInvestedAmount(
    initialDeposit,
    contribution,
    frequency,
    term
  );
  const returnAmounts = calculateReturnAmount(investedAmounts, percent);
  const futureBalance = calculateFutureBalance(investedAmounts, returnAmounts);

  console.log("Invested Amounts:", investedAmounts);
  console.log("Return Amounts:", returnAmounts);
  console.log("Future Balance:", futureBalance);

  const graphData = [[], [], []];
  const startYear = new Date().getFullYear();
  for (let i = 0; i <= term; i++) {
    graphData.push({
      year: startYear + i,
      investedAmount: investedAmounts[i],
      returnAmount: returnAmounts[i],
    });
  }
  return { graphData, futureBalance };
};

export {
  calculateInvestedAmount,
  calculateReturnAmount,
  calculateFutureBalance,
  handleSubmit,
};
