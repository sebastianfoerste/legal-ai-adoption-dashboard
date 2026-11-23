# Privacy

This kit contains no personal data and no client data. It is a content folder in the
legal-ai-adoption-dashboard repository, with `scripts/check.sh` and three standard-library
Python scripts.

- Every example is generic or synthetic. The account in the examples is invented; the email
  templates use `{{merge_field}}` placeholders you replace per engagement.
- The scripts collect, store and transmit nothing. They read and write only local files in
  `workshop-kit/`: two of them regenerate the generated pilot plan and the unified kit, the
  other two check the document set and its links, and none uses the network.
- The HTML version of the unified kit (`enablement/workshop-kit-unified.html`) loads nothing
  from a third party: it uses system fonts and contains no external stylesheet, script or
  image, so opening it in a browser sends no request anywhere (checked by
  `tests/test_compile_kit.py`).

The kit itself teaches a privacy-first rollout: no client data into untrusted systems,
workshops run on synthetic documents, and a human-review gate on every output. It describes
how to adopt a reviewed product responsibly; it never stands in for legal advice.

Report a privacy concern as an issue on the
[legal-ai-adoption-dashboard repository](https://github.com/sebastianfoerste/legal-ai-adoption-dashboard/issues).
