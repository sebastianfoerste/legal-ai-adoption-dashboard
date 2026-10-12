.PHONY: install dev test lint build check dashboard-check contract-check boundary-check feedback-check workshop-check workshop-export

install: ; pnpm install
dev: ; pnpm dev
test: ; pnpm test
lint: ; pnpm lint
build: ; pnpm build
dashboard-check: lint test build

contract-check:
	pnpm contract:test
	pnpm telemetry:validate

# No participant record or identifying field in the public tree.
boundary-check:
	pnpm boundary:check

# Python tests, and the committed backlog and memo must match what the code generates.
feedback-check:
	$(MAKE) -C product-feedback-loop check

workshop-check:
	$(MAKE) -C workshop-kit check

workshop-export:
	scripts/export-workshop-kit.sh

check: dashboard-check contract-check boundary-check feedback-check workshop-check
