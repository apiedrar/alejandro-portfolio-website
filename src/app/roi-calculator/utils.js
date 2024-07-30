const calculateInvestedAmount = (
  initialDeposit = 1200,
  contribution = 200,
  frequency,
  term = 5
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

const calculateReturnAmount = (investedAmounts, percent = 15) => {
  const annualReturnRate = percent / 100;

  return investedAmounts.map((amount) => {
    return amount * annualReturnRate;
  });
  return returnAmounts;
};

const calculateReinvestedReturn = (returnAmounts, percent = 15) => {
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
  const { initialDeposit, contribution, frequency, term, percent } = formData;

  let investedAmounts = calculateInvestedAmount(
    initialDeposit,
    contribution,
    frequency,
    term
  );
  let returnAmounts = calculateReturnAmount(investedAmounts, percent);
  let reinvestedReturns = calculateReinvestedReturn(returnAmounts, percent);

  const graphData = [];
  for (let i = 0; i < term; i++) {
    graphData.push({
      year: i + 1,
      investedAmount: investedAmounts[i],
      returnAmount: returnAmounts[i],
      reinvestedReturn: reinvestedReturns[i],
    });
  }
  console.log(graphData);
};

export {
  calculateInvestedAmount,
  calculateReturnAmount,
  calculateReinvestedReturn,
  handleSubmit,
};
