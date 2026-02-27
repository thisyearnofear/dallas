#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Pre-commit hook to prevent accidentally committing secrets.
 * Enforces the ZERO-SECRET POLICY outlined in AGENTS.md.
 */

// Colors for terminal output
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

// List of filenames/patterns that should NEVER be committed
const FORBIDDEN_FILES = [
    /\.env.*/,
    /.*\.key$/,
    /.*\.pem$/,
    /.*\.secret$/,
    /credentials\.json/,
    /id\.json/,
    /.*-keypair\.json/,
];

// List of regex patterns to scan for inside staged files
const FORBIDDEN_PATTERNS = [
    {
        regex: /ARV_[a-zA-Z0-9_]{20,}/g,
        description: "Vercel Token",
    },
    {
        regex: /(?:sk_live|sk_test)_[a-zA-Z0-9]{20,}/g,
        description: "Stripe Secret Key",
    },
    {
        regex: /(?:AKIA|rk_live|sk_test)_[a-zA-Z0-9]{20,}/g,
        description: "AWS/Stripe Key",
    },
    {
        regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,}/g,
        description: "GitHub Personal Access Token",
    },
    {
        regex: /-----BEGIN PRIVATE KEY-----/g,
        description: "Private Key Block",
    },
    {
        regex: /"private_key":\s*".+"/g,
        description: "JSON Private Key",
    },
];

// Files to skip scanning (e.g. documentation, lockfiles)
const IGNORED_FILES_FOR_SCAN = [
    "pnpm-lock.yaml",
    "package-lock.json",
    "AGENTS.md",
    "scripts/check-secrets.cjs",
];

console.log(`${YELLOW}🛡️  Scanning staged files for secrets...${RESET}`);

try {
    // Get list of staged files
    const stagedFilesOutput = execSync(
        "git diff --cached --name-only --diff-filter=ACM",
        { encoding: "utf8" },
    );
    const stagedFiles = stagedFilesOutput
        .split("\n")
        .filter((file) => file.trim().length > 0);

    if (stagedFiles.length === 0) {
        console.log(`${GREEN}✅ No files to check.${RESET}`);
        process.exit(0);
    }

    let foundSecrets = false;

    for (const file of stagedFiles) {
        const filename = path.basename(file);

        // 1. Check for forbidden file names
        for (const pattern of FORBIDDEN_FILES) {
            if (pattern.test(filename)) {
                // Exception: .env.example is usually allowed
                if (filename === ".env.example") continue;

                console.error(
                    `\n${RED}❌ ERROR: Attempting to commit a forbidden file!${RESET}`,
                );
                console.error(`File: ${file}`);
                console.error(
                    `Reason: Matches forbidden filename pattern (${pattern})`,
                );
                foundSecrets = true;
            }
        }

        // 2. Scan file contents for secrets (skip ignored files or non-text files)
        if (!IGNORED_FILES_FOR_SCAN.includes(file) && fs.existsSync(file)) {
            // Basic check to ensure it's not a binary file (e.g. images)
            const isLikelyBinary =
                /\.(png|jpe?g|gif|ico|woff2?|wasm|so|rlib)$/i.test(filename);

            if (!isLikelyBinary) {
                const content = fs.readFileSync(file, "utf8");

                for (const { regex, description } of FORBIDDEN_PATTERNS) {
                    const matches = content.match(regex);
                    if (matches) {
                        console.error(
                            `\n${RED}❌ ERROR: Detected potential secret in staged file!${RESET}`,
                        );
                        console.error(`File: ${file}`);
                        console.error(`Secret Type: ${description}`);
                        console.error(
                            `To bypass (if false positive), remove the file from staging or use 'git commit --no-verify' at your own risk.`,
                        );
                        foundSecrets = true;
                    }
                }
            }
        }
    }

    if (foundSecrets) {
        console.error(
            `\n${RED}🛑 COMMIT REJECTED: Please remove the secrets from the files above before committing.${RESET}`,
        );
        process.exit(1);
    } else {
        console.log(`${GREEN}✅ No secrets detected. Commit allowed.${RESET}`);
        process.exit(0);
    }
} catch (error) {
    console.error(
        `${RED}Failed to run secret check hook:${RESET}`,
        error.message,
    );
    process.exit(1);
}
