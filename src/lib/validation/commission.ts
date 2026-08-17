import { z } from "zod";

export const commissionRequestSchema = z.object({
  brief: z.string().trim().min(20, "Tell the artist a little more about what you want.").max(2000),
  serviceId: z.string().min(1, "Choose a service."),
  characterCount: z.coerce.number().int().min(1).max(5),
  intendedUse: z.enum(["personal", "commercial"]),
  budget: z.coerce.number().min(1).max(10000),
  deadline: z.string().min(1, "Choose a preferred deadline."),
  notes: z.string().max(1500).optional(),
  rulesAccepted: z.literal(true, { errorMap: () => ({ message: "Accept the artist's commission rules." }) }),
});

export type CommissionRequestInput = z.infer<typeof commissionRequestSchema>;
