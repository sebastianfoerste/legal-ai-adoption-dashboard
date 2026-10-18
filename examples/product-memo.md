> **Correction, 6 October 2026.** This report is superseded and kept for the record. Its score
> counted reach twice, and any "Status" it prints was assigned by rank with no delivery record
> behind it; no requirement named here was shipped. Corrected output:
> [`product-feedback-loop/examples/product-memo.md`](../product-feedback-loop/examples/product-memo.md).
> `prioritized-backlog.json` in this folder is the output of the same superseded run, unchanged
> except that its synthetic account names were renamed Firm A to Firm E on 18 October 2026.

# What we heard, what we changed

_Customer feedback memo · Q2 2026 (synthetic) · synthetic_

A short, repeatable note closing the loop with customers: the top themes we heard, the requirement each maps to, and where it is.

## 1. No audit trail for AI-assisted edits

- **What we heard:** “Without an exportable audit log this fails our internal review.” (raised by 3 accounts: Firm A (synthetic), Firm B (synthetic), Firm D (synthetic))
- **Severity / reach:** blocker, 3 accounts · priority score 173
- **What we're changing:** Exportable, append-only audit log of every AI-assisted edit (who, what, when).
- **Status:** shipped

## 2. Can't restrict who approves sensitive matters

- **What we heard:** “We need approval permissions by practice group.” (raised by 2 accounts: Firm B (synthetic), Firm D (synthetic))
- **Severity / reach:** high, 2 accounts · priority score 65
- **What we're changing:** Role-based approval permissions, scoped by practice group and matter value.
- **Status:** in progress

## 3. Hard to onboard associates

- **What we heard:** “The first session is great, then people drift back to old habits.” (raised by 2 accounts: Firm A (synthetic), Firm C (synthetic))
- **Severity / reach:** high, 2 accounts · priority score 34
- **What we're changing:** Guided in-product onboarding flow with role-specific first tasks.
- **Status:** planned

---

_Synthetic customer feedback. Product communication artifact, not legal advice._
