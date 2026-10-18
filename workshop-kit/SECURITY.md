# Security

This kit is a content folder in the legal-ai-adoption-dashboard repository: Markdown
documents, a synthetic example intake, `scripts/check.sh` and three standard-library Python
scripts. There is no application, no third-party dependency and no data collection.

- Two of the Python scripts regenerate files: `generate_pilot_plan.py` writes
  `examples/generated-pilot-plan.md`, and `compile_kit.py` writes the unified kit
  (`enablement/workshop-kit-unified.md` and `.html`). `check.sh` verifies that the required
  documents exist and contain no placeholder markers, and `link_checker.py` checks relative
  links.
- The scripts read and write only local files in `workshop-kit/`. None of them uses the
  network, secrets, credentials or API keys.
- All examples are generic or synthetic; the email templates use `{{merge_field}}`
  placeholders, not real values.

If you find an issue (for example, a problem in one of the scripts), open an issue on the
[legal-ai-adoption-dashboard repository](https://github.com/sebastianfoerste/legal-ai-adoption-dashboard/issues).
This kit has no runtime surface and holds no data, so there is no sensitive-disclosure path.
