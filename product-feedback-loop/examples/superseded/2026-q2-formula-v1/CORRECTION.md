# Superseded outputs, formula version 1

**Use this when** you need to see what the feedback pipeline reported before the correction of 6 October 2026.

The three files in this folder are the outputs of formula version 1, unchanged except for the correction note at the top of the two Markdown files and the synthetic account names. On 18 October 2026 the five placeholder accounts were renamed Firm A to Firm E (synthetic), in the input and in the two outputs that list them; apart from those names, `prioritized-backlog.json` is byte-identical to the earlier output.

What was wrong:

1. **Reach counted twice.** Score = severity weight × accounts reached × revenue signal, and the revenue signal was the sum over the same accounts. A theme raised by three accounts was multiplied by three twice.
2. **Missing or zero revenue erased a theme.** An account with band `none`, or with an unrecognised band, contributed zero, so a theme raised only by such accounts scored zero whatever its severity.
3. **Delivery status followed rank.** The memo printed "shipped", "in progress" and "planned" for ranks one to three. No record stood behind those words.

What replaced it: `feedback-loop.score.v2` in `src/feedback_loop/scoring.py`, a separate lane for quality and control failures, and delivery status read from `data/evidence-loop.json`.
