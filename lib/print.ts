/**
 * The line every printed page carries (docs/adr/0004-exports.md). The layout renders it as a
 * print-only table footer group, which Firefox repeats on each printed page; Chromium prints
 * the same line from the @bottom-center page margin box in globals.css.
 */
export const PRINT_NOTICE = "Synthetic data. Draft for account-owner review; not legal advice.";
