import { describe,expect,it } from "vitest";
import { calculateProfit } from "./profit";
describe("profit engine",()=>{it("distinguishes revenue, gross and estimated net profit",()=>{expect(calculateProfit({revenue:24,productCost:7.2,packagingCost:.8,shippingCost:1.6,paymentFee:.7,platformFee:0,advertisingCost:2.4,discount:.8,refunds:.5,otherCost:.47})).toEqual({revenue:24,grossProfit:16,estimatedNetProfit:9.53,directCosts:8,operatingCosts:6.47,marginPercent:66.67})});});
