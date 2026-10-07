PYTHON ?= python3
PYTHONPATH := src
.PHONY: install test demo check clean
install:
	@echo "No third-party dependencies. Pure standard library."
	@$(PYTHON) --version
test:
	@PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m unittest discover -s tests -t . -q
demo:
	@PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m feedback_loop.cli --input data/interviews.json --out examples --quiet
	@echo "wrote examples/prioritized-backlog.md, .json and product-memo.md"
# The committed examples must be what the code produces from the committed inputs.
check: test
	@rm -rf .check-out && PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m feedback_loop.cli --input data/interviews.json --out .check-out --quiet
	@for f in prioritized-backlog.md prioritized-backlog.json product-memo.md; do \
		cmp -s .check-out/$$f examples/$$f || { echo "STALE: examples/$$f differs from generated output; run make demo"; rm -rf .check-out; exit 1; }; \
	done
	@rm -rf .check-out
	@echo "OK: feedback-loop tests pass and committed examples match the generated output."
clean:
	@find . -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
