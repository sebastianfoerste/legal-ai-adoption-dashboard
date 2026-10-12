import evidenceLoopJson from "../../data/evidence-loop.json";
import { assertPublicStore } from "./private-boundary";
import { evidenceStoreSchema, type EvidenceStore } from "./schema";

export const EVIDENCE_SOURCE_FILE = "data/evidence-loop.json";

// Checked before parsing, so a private record fails loudly instead of being rendered.
assertPublicStore(evidenceLoopJson);
const store: EvidenceStore = evidenceStoreSchema.parse(evidenceLoopJson);

/** The bundled, public store. Real participant observations are never loaded from here. */
export const getEvidenceStore = (): EvidenceStore => store;

/**
 * Practitioner evidence, as opposed to the synthetic demonstration cases. Empty until an
 * approved aggregate from the private store is published.
 */
export const practitionerEvidence = (source: EvidenceStore = store) => ({
  sessions: source.sessions.filter((s) => s.origin.kind !== "synthetic_fixture"),
  observations: source.observations.filter((o) => o.origin.kind !== "synthetic_fixture"),
  changes: source.changes.filter((c) => c.origin.kind !== "synthetic_fixture"),
});
