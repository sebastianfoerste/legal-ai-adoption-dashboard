import adoptionPeriodsJson from "../../data/adoption-periods.json";
import engagementsJson from "../../data/engagements.json";
import interventionsJson from "../../data/interventions.json";
import teamJson from "../../data/team.json";
import valueMeasurementsJson from "../../data/value-measurements.json";
import {
  adoptionSeriesSchema,
  engagementSchema,
  interventionSchema,
  teamSchema,
  valueMeasurementSchema,
  type AdoptionSeries,
  type Engagement,
  type Intervention,
  type Team,
  type ValueMeasurement,
} from "./schema";

export const ENGAGEMENT_SOURCE_FILES = [
  "data/adoption-periods.json",
  "data/engagements.json",
  "data/interventions.json",
  "data/team.json",
  "data/value-measurements.json",
] as const;

const adoptionSeries: AdoptionSeries[] = adoptionSeriesSchema.array().parse(adoptionPeriodsJson);
const engagements: Engagement[] = engagementSchema.array().parse(engagementsJson);
const interventions: Intervention[] = interventionSchema.array().parse(interventionsJson);
const team: Team = teamSchema.parse(teamJson);
const valueMeasurements: ValueMeasurement[] = valueMeasurementSchema
  .array()
  .parse(valueMeasurementsJson);

export const getAdoptionSeries = (): AdoptionSeries[] => adoptionSeries;
export const getEngagements = (): Engagement[] => engagements;
export const getInterventions = (): Intervention[] => interventions;
export const getTeam = (): Team => team;
export const getValueMeasurements = (): ValueMeasurement[] => valueMeasurements;

export const getEngagement = (accountId: string): Engagement | undefined =>
  engagements.find((engagement) => engagement.accountId === accountId);

export const specialistLabel = (specialistId: string): string =>
  team.specialists.find((specialist) => specialist.id === specialistId)?.label ?? specialistId;
