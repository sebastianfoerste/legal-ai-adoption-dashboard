.PHONY: install dev test build check

install: ; pnpm install
dev: ; pnpm dev
test: ; pnpm test
build: ; pnpm build
check: test build
