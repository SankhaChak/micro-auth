export const calculateDiscount = (
  price: number,
  percentageDiscount: number
) => {
  return (price * percentageDiscount) / 100;
};
