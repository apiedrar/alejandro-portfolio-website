const handleSubmit = (formData) => {
  const { initialDeposit, contribution, frequency, term, percent } = formData;

  const quantifiedFrequency = () => {
    if (frequency === "Annual") {
      console.log(1);
    } else if (frequency === "Monthly") {
      console.log(12);
    } else if (frequency === "Weekly") {
      console.log(52);
    } else if (frequency === "Daily") {
      console.log(365);
    } else {
      console.log("Sorry, you have to define a frequency for your deposits");
    }
  };

  return quantifiedFrequency();
};

export { handleSubmit };
