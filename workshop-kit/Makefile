PYTHON ?= python3
.PHONY: check test generate-pilot compile

generate-pilot:
	$(PYTHON) scripts/generate_pilot_plan.py examples/synthetic-input.json examples/generated-pilot-plan.md

compile:
	$(PYTHON) scripts/compile_kit.py

test:
	PYTHONPATH=scripts $(PYTHON) -m unittest discover -s tests -q

check: test generate-pilot compile
	sh scripts/check.sh
	$(PYTHON) scripts/link_checker.py
