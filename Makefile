.PHONY: install dev test build check dashboard-check contract-check workshop-check workshop-export

install: ; pnpm install
dev: ; pnpm dev
test: ; pnpm test
build: ; pnpm build
dashboard-check: test build

contract-check:
	pnpm contract:test
	pnpm telemetry:validate

workshop-check:
	$(MAKE) -C workshop-kit check

workshop-export:
	scripts/export-workshop-kit.sh

check: dashboard-check workshop-check
	pnpm telemetry:validate
