import { cn } from "@/lib/utils";

type Props = {
  value: number;
  className?: string;
};

const ProductPrice = ({ value, className }: Props) => {
  //Ensure two decimal places
  const stringValue = value.toFixed(2);
  // Get the integer and the float values
  const [intValue, floatValue] = stringValue.split(".");
  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{floatValue}</span>
    </p>
  );
};

export default ProductPrice;
