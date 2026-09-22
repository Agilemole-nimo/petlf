import { z } from "zod";

export const profitInputSchema = z.object({
  revenue:z.number().finite(), productCost:z.number().nonnegative().default(0), packagingCost:z.number().nonnegative().default(0), shippingCost:z.number().nonnegative().default(0), paymentFee:z.number().nonnegative().default(0), platformFee:z.number().nonnegative().default(0), advertisingCost:z.number().nonnegative().default(0), discount:z.number().nonnegative().default(0), refunds:z.number().nonnegative().default(0), otherCost:z.number().nonnegative().default(0)
});
export type ProfitInput = z.infer<typeof profitInputSchema>;
export function calculateProfit(raw:ProfitInput){
  const input=profitInputSchema.parse(raw);
  const directCosts=input.productCost+input.packagingCost;
  const grossProfit=input.revenue-directCosts;
  const operatingCosts=input.shippingCost+input.paymentFee+input.platformFee+input.advertisingCost+input.discount+input.refunds+input.otherCost;
  return { revenue:round(input.revenue), grossProfit:round(grossProfit), estimatedNetProfit:round(grossProfit-operatingCosts), directCosts:round(directCosts), operatingCosts:round(operatingCosts), marginPercent:input.revenue===0?0:round((grossProfit/input.revenue)*100) };
}
const round=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
