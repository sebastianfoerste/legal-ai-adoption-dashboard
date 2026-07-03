PYTHON ?= python3
PYTHONPATH := src
.PHONY: install test demo clean
install:
	@echo "No third-party dependencies. Pure standard library."
	@$(PYTHON) --version
test:
	@PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m unittest discover -s tests -t . -q
demo:
	@PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m feedback_loop.cli --input data/interviews.json --out examples
clean:
	@find . -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
