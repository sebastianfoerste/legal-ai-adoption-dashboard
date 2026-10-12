# Security

This is a content repository — markdown documents only. There is no application, no code to
execute, no dependencies, and no data collection.

- The only script is `scripts/check.sh`, which verifies that the required documents exist and
  contain no placeholder markers. It reads local files and writes nothing.
- No secrets, credentials, or API keys are used anywhere.
- All examples are generic or synthetic; the email templates use `{{merge_field}}`
  placeholders, not real values.

If you find an issue (for example, a problem in `check.sh`), open an issue on the repository.
There is no runtime surface and no data, so there is no sensitive-disclosure path.
