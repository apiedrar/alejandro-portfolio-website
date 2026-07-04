type Frequency = "Daily" | "Weekly" | "Monthly" | "Annual";

const FREQUENCY_MAP: Record<Frequency, number> = {
  Daily: 365,
  Weekly: 52,
  Monthly: 12,
  Annual: 1,
};

interface FormData {
  initialDeposit: number;
  contribution: number;
  frequency: Frequency;
  term: number;
  percent: number;
}

interface GraphDataPoint {
  year: number;
  investedAmount: number;
  returnAmount: number;
}

const calculateInvestedAmount = (
  initialDeposit: number,
  contribution: number,
  frequency: Frequency,
  term: number
): number[] => {
  const contributionSpans = FREQUENCY_MAP[frequency];
  const annualContribution = contribution * contributionSpans;

  const investedAmounts: number[] = [];
  for (let i = 0; i <= term; i++) {
    investedAmounts.push(initialDeposit + annualContribution * i);
  }
  return investedAmounts;
};

const calculateReturnAmount = (
  initialDeposit: number,
  contribution: number,
  frequency: Frequency,
  term: number,
  percent: number
): number[] => {
  const contributionSpans = FREQUENCY_MAP[frequency];
  const annualContribution = contribution * contributionSpans;
  const annualReturnRate = percent / 100;

  let totalInvested = initialDeposit;
  const returnAmounts: number[] = [];

  for (let i = 0; i <= term; i++) {
    if (i > 0) {
      const previousAmount = totalInvested + returnAmounts[i - 1];
      returnAmounts.push(Math.round(previousAmount * annualReturnRate));
    } else {
      returnAmounts.push(0);
    }
    totalInvested += annualContribution;
  }

  return returnAmounts;
};

const calculateFutureBalance = (
  initialDeposit: number,
  contribution: number,
  frequency: Frequency,
  term: number,
  percent: number
): number => {
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

const handleSubmit = ({
  formData,
}: {
  formData: FormData;
}): { graphData: GraphDataPoint[]; futureBalance: number } => {
  const { initialDeposit, contribution, frequency, term, percent } = formData;

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

  const graphData: GraphDataPoint[] = [];
  const startYear = new Date().getFullYear();
  let totalReturns = 0;

  for (let i = 0; i <= term; i++) {
    if (i > 0) {
      totalReturns += returnAmounts[i - 1];
    }
    graphData.push({
      year: startYear + i,
      investedAmount: initialDeposit + contribution * FREQUENCY_MAP[frequency] * i,
      returnAmount: totalReturns + returnAmounts[i],
    });
  }

  return { graphData, futureBalance };
};

export type { Frequency, FormData, GraphDataPoint };
export { calculateInvestedAmount, calculateReturnAmount, calculateFutureBalance, handleSubmit };
