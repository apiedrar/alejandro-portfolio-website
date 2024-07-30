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
  return returnAmounts;
};

const calculateReinvestedReturn = (returnAmounts, percent) => {
  const annualReturnRate = percent / 100;

  let reinvestedReturns = [];
  let totalReinvested = 0;

  returnAmounts.forEach((returnAmount, i) => {
    totalReinvested += returnAmount;
    reinvestedReturns.push(totalReinvested * annualReturnRate);
  });
  return reinvestedReturns;
};

const handleSubmit = (formData) => {
  let { initialDeposit, contribution, frequency, term, percent } = formData;

  const investedAmounts = calculateInvestedAmount(
    (initialDeposit = 1200),
    (contribution = 200),
    frequency,
    (term = 5)
  );
  const returnAmounts = calculateReturnAmount(investedAmounts, (percent = 15));
  const reinvestedReturns = calculateReinvestedReturn(
    returnAmounts,
    (percent = 15)
  );

  const graphData = [];
  for (let i = 0; i < term; i++) {
    graphData.push;
    ({
      year: i + 1,
      investedAmount: investedAmounts[i],
      returnAmount: returnAmounts[i],
      reinvestedReturn: reinvestedReturns[i],
    });
  }
  console.log(graphData);
};

/* const handleSubmit = (formData) => {
  const { initialDeposit, contribution, frequency, term, percent } = formData;

  const quantifiedFrequency = () => {
    if (frequency === "Annual") {
      return 1;
    } else if (frequency === "Monthly") {
      return 12;
    } else if (frequency === "Weekly") {
      return 52;
    } else if (frequency === "Daily") {
      return 365;
    } else {
      return "Sorry, you have to define a frequency for your deposits";
    }
  };

  const totalInvestment = () => {
    let contributionTimesFrequency = contribution * quantifiedFrequency;
    let totalContribution = Array.from(
      { length: term },
      () => contributionTimesFrequency
    );
    console.log(totalContribution);
  };

  return totalInvestment();
};
 */

export {
  calculateInvestedAmount,
  calculateReturnAmount,
  calculateReinvestedReturn,
  handleSubmit,
};
