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

const calculateReturnAmount = (
  initialDeposit,
  contribution,
  frequency,
  term,
  percent
) => {
  const frequencyMap = {
    Daily: 365,
    Weekly: 52,
    Monthly: 12,
    Annual: 1,
  };

  const contributionSpans = frequencyMap[frequency];
  const annualContribution = contribution * contributionSpans;
  const annualReturnRate = percent / 100;

  let totalInvested = initialDeposit;
  let returnAmounts = [];

  for (let i = 0; i <= term; i++) {
    if (i > 0) {
      const previousAmount = totalInvested + returnAmounts[i - 1];
      returnAmounts.push(Math.round(previousAmount * annualReturnRate));
    } else {
      returnAmounts.push(0); // No return in the initial year
    }
    totalInvested += annualContribution;
  }

  return returnAmounts;
};

const calculateFutureBalance = (
  initialDeposit,
  contribution,
  frequency,
  term,
  percent
) => {
  const investedAmounts = calculateInvestedAmount(
    initialDeposit,
    contribution,
    frequency,
    term
  );
  const returnAmounts = calculateReturnAmount(
    initialDeposit,
    contribution,
    frequency,
    term,
    percent
  );

  let totalBalance = 0;
  for (let i = 0; i <= term; i++) {
    totalBalance += investedAmounts[i] + returnAmounts[i];
  }
  return Math.round(totalBalance);
};

const handleSubmit = ({ formData }) => {
  const { initialDeposit, contribution, frequency, term, percent } = formData;

  const frequencyMap = {
    Daily: 365,
    Weekly: 52,
    Monthly: 12,
    Annual: 1,
  };
  const investedAmounts = calculateInvestedAmount(
    initialDeposit,
    contribution,
    frequency,
    term
  );
  const returnAmounts = calculateReturnAmount(
    initialDeposit,
    contribution,
    frequency,
    term,
    percent
  );
  const futureBalance = calculateFutureBalance(
    initialDeposit,
    contribution,
    frequency,
    term,
    percent
  );

  console.log("Invested Amounts:", investedAmounts);
  console.log("Return Amounts:", returnAmounts);
  console.log("Future Balance:", futureBalance);

  const graphData = [[], [], []];
  const startYear = new Date().getFullYear();
  let totalInvested = initialDeposit;

  for (let i = 0; i <= term; i++) {
    if (i > 0) {
      totalInvested += returnAmounts[i - 1]; // Add previous year's return to total invested
    }
    graphData.push({
      year: startYear + i,
      investedAmount:
        totalInvested + contribution * frequencyMap[frequency] * i,
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
