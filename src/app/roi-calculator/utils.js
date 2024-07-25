import InitialDeposit from "./InitialDeposit";
import Contribution from "./Contribution";
import DepositFrequency from "./Frequency.jsx";
import Term from "./Term";
import Percent from "./Percent";

const Freq = DepositFrequency;

const quantifiedFrequency = () => {
  switch (Freq.frequency) {
    case "Annual":
      console.log(1);
      break;
    case "Monthly":
      console.log(12);
      break;
    case "Weekly":
      console.log(52);
      break;
    case "Daily":
      console.log(365);
      break;
    default:
      console.log("Sorry, you have to choose a frequency");
  }
};

export { quantifiedFrequency };
