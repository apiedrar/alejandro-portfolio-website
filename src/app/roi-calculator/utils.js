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

  const investedAmounts = new Array(term).fill(0).map((_, i) => {
    return initialDeposit + annualContribution * i;
  });
  return investedAmounts;
};

const calculateReturnAmount = (investedAmounts, percent) => {
  const annualReturnRate = percent / 100;

  return investedAmounts.map((amount) => {
    return amount * annualReturnRate;
  });
};

const calculateReinvestedReturn = (returnAmounts, percent) => {
  const annualReturnRate = percent / 100;
  let reinvestedReturns = [];
  let totalReinvested = 0;

  returnAmounts.forEach((returnAmount) => {
    totalReinvested += returnAmount;
    reinvestedReturns.push(totalReinvested * annualReturnRate);
  });
  return reinvestedReturns;
};

const calculateFutureBalance = (investedAmounts, reinvestedReturns) => {
  const totalInvested = investedAmounts.reduce(
    (acc, investedAmount) => acc + investedAmount,
    0
  );
  const totalReinvestedReturns = reinvestedReturns.reduce(
    (acc, reinvestedReturn) => acc + reinvestedReturn,
    0
  );
  return totalInvested + totalReinvestedReturns;
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
  const reinvestedReturns = calculateReinvestedReturn(returnAmounts, percent);
  const futureBalance = calculateFutureBalance(
    investedAmounts,
    reinvestedReturns
  );

  console.log("Invested Amounts:", investedAmounts);
  console.log("Return Amounts:", returnAmounts);
  console.log("Reinvested Returns:", reinvestedReturns);
  console.log("Future Balance:", futureBalance);

  const graphData = [];
  for (let i = 0; i < term; i++) {
    graphData.push({
      year: i + 1,
      investedAmount: investedAmounts[i],
      returnAmount: returnAmounts[i],
      reinvestedReturn: reinvestedReturns[i],
    });
  }
  return graphData;
};

export {
  calculateInvestedAmount,
  calculateReturnAmount,
  calculateReinvestedReturn,
  calculateFutureBalance,
  handleSubmit,
};
