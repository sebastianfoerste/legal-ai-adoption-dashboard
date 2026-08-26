.PHONY: check generate-pilot compile

generate-pilot:
	python scripts/generate_pilot_plan.py examples/synthetic-input.json examples/generated-pilot-plan.md

compile:
	python scripts/compile_kit.py

check: generate-pilot compile
	sh scripts/check.sh
	python scripts/link_checker.py
