import * as yup from "yup";


export const applicationSchema = yup.object({
    jobDescription: yup
      .string()
      .min(50, { message: "Job description is required" }).required(),
  });

export type ApplicationType = yup.InferType<typeof applicationSchema>;