import { z } from "zod";

export const SurveyObservationSchema = z.object({
  species: z.string().min(1, "Species is required"),
  count: z.number().int().positive("Count must be a positive integer"),
  adults: z.number().int().nonnegative().optional(),
  juveniles: z.number().int().nonnegative().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  habitat: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const WildlifeSurveySchema = z.object({
  park_id: z.string().uuid("Invalid Park ID"),
  survey_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  observers: z.array(z.string()).min(1, "At least one observer is required"),
  area_block: z.string().min(1, "Area/Block is required"),
  observations: z.array(SurveyObservationSchema).min(1, "At least one observation is required"),
});

export type WildlifeSurvey = z.infer<typeof WildlifeSurveySchema>;
export type SurveyObservation = z.infer<typeof SurveyObservationSchema>;
