#!/bin/sh
set -eu

REQUIRED="
README.md
what-this-proves.md
sessions/60-min-workshop-agenda.md
sessions/30-min-partner-briefing.md
sessions/90-min-associate-hands-on.md
discovery/adoption-questionnaire.md
discovery/workflow-discovery-template.md
discovery/use-case-prioritization-matrix.md
discovery/roi-calculator.md
enablement/skeptical-partner-objections.md
enablement/follow-up-email-templates.md
enablement/product-feedback-template.md
enablement/adoption-maturity-model.md
enablement/workshop-kit-unified.md
enablement/workshop-kit-unified.html
docs/reviewer-guide.md
docs/customer-workflow.md
docs/product-feedback-notes.md
examples/synthetic-input.json
examples/sample-output.md
examples/generated-pilot-plan.md
SECURITY.md
PRIVACY.md
"

status=0
for f in $REQUIRED; do
  if [ ! -f "$f" ]; then
    echo "MISSING: $f"
    status=1
  fi
done

if grep -rIl -E 'TODO|TBD|FIXME|\[fill in\]|lorem ipsum' --include='*.md' . >/dev/null 2>&1; then
  echo "PLACEHOLDER markers found:"
  grep -rIn -E 'TODO|TBD|FIXME|\[fill in\]|lorem ipsum' --include='*.md' .
  status=1
fi

[ "$status" -eq 0 ] && echo "OK: all required documents present, no placeholders."
exit "$status"
