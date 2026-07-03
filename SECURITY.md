# Security

This is a demonstration app built on synthetic data. It has no authentication, no
database, no external API calls, and handles no real or personal data.

- All data lives in static JSON under `data/` and is fabricated. See `data/README.md`.
- No secrets, API keys, or credentials are required to run, build, or test the app.
- No network requests are made at runtime; the synthetic data is bundled.

If you find a security issue in the code (for example, a dependency advisory), open an
issue on the repository. Because there is no real data and no deployment surface, there
is no sensitive-disclosure path to follow.
