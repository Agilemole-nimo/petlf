import { z } from "zod";

export const pageQuerySchema = z.object({ page:z.coerce.number().int().positive().default(1), pageSize:z.coerce.number().int().min(1).max(100).default(25), sort:z.string().optional(), query:z.string().trim().max(120).optional() });
export type PageQuery = z.infer<typeof pageQuerySchema>;
export type ApiSuccess<T> = { data:T; meta?:{ page?:number; pageSize?:number; total?:number; requestId?:string } };
export type ApiError = { error:{ code:string; message:string; requestId:string; details?:unknown } };
export const permissions = ["products.read","products.write","orders.read","orders.write","analytics.read","seo.read","seo.write","content.read","content.write","settings.write","users.write"] as const;
export type Permission = typeof permissions[number];
