# GitBounty Court

**Internet Court × Arkhai (Alkahest / Git escrow) × GenLayer**

GitBounty Court demonstrates a dispute workflow for software bounties. Arkhai's Git escrow is the bounty / conditional-settlement rail. GenLayer is the adjudication rail: when a submitted GitHub pull request is disputed, a GenLayer Intelligent Contract independently fetches the public PR and changed-file evidence, asks validators to assess it against the agreed acceptance criteria, and records the consensus-backed decision.

> **Current deliverable status:** this repository is a reproducible integration starter and local UI prototype. The GenLayer contract source and workflow are provided; a live Bradbury deployment, live Arkhai escrow transaction, and final edited video still require the user's network wallet, testnet funds, and partner-specific deployment configuration. Do not present the local preview as a live on-chain transaction.

## Why this is not a decorative GenLayer integration

The contract's `adjudicate_pull_request` method reads the public GitHub PR API and changed-file API from inside GenLayer's non-deterministic execution context. It uses `gl.eq_principle.prompt_non_comparative(...)`, so validators independently fetch the same evidence and judge whether the proposed structured verdict satisfies the declared task and criteria. The accepted result is then stored in GenLayer contract state. This is the central decision point, not a UI-side AI call.

GenLayer's docs require non-deterministic web / LLM operations to run through an Equivalence Principle method and warn against trusting a leader's output based only on schema checks. See:
- https://docs.genlayer.com/developers/intelligent-contracts/first-intelligent-contract
- https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle
- https://docs.genlayer.com/developers/intelligent-contracts/features/web-access

## Architecture

1. **Arkhai / Git escrow:** create a bounty using Arkhai's `git-commit-trading` / `git-escrows` workflow. The escrow ID and chain transaction are recorded in the deal manifest.
2. **GitHub:** the repository, issue and pull request are the public work/evidence surface.
3. **GenLayer:** the Intelligent Contract fetches the PR and changed-file evidence and records a consensus-backed decision (`APPROVE`, `REJECT`, or `INCONCLUSIVE`).
4. **Settlement:** use the Arkhai escrow's configured arbiter / fulfillment workflow to settle according to the verdict. This starter deliberately does not pretend that a GenLayer contract on Bradbury can directly move assets on an EVM escrow chain. A cross-chain attestation/relayer or supported Alkahest arbiter adapter must be configured for automatic settlement.

## Repository layout

```text
contracts/gitbounty_court.py    GenLayer Intelligent Contract
demo/index.html                 Click-through local product preview (not live-chain)
docs/architecture.md            Trust boundaries and integration design
docs/demo-shotlist.md           45-second demo script and edit plan
arkhai/README.md                Arkhai escrow setup and integration boundary
SKILL.md                        Reproducible operator workflow
scripts/validate_contract.py    Lightweight source sanity checks
tests/test_source_checks.py     Local source checks
.env.example                    Configuration template
```

## Quick start


### 1. Requirements

- Python 3.12+
- Node.js 20+ and npm
- GenLayer Studio and the GenLayerJS SDK
- MetaMask browser extension
- A funded wallet with the required GenLayer Studio testnet tokens
- A public GitHub repository and pull request for evidence
- Arkhai's official `git-commit-trading` / `git-escrows` tooling and a supported EVM test network for escrow integration

### 2. Validate the contract source locally

Run these commands from the repository root:

```bash
python scripts/validate_contract.py
python -m unittest discover -s tests -v
```

These checks validate the contract source structure and run the local test suite. They do not replace GenLayer Studio compilation or deployment.

### 3. Run the live frontend

From the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Connect MetaMask to interact with the GitBounty Court dashboard. The frontend reads the deployed GenLayer contract and displays the bounty and latest court verdict.

To create a production build:

```bash
npm run build
```

### 4. Deploy the Intelligent Contract

The current GitBounty Court contract is deployed on GenLayer Studio Network.

- Contract address: `0x48f711c6FeBB1f084D4861feCc2fdCFE38E11986`
- Deployment transaction: `0xfbbf8a1ac48d7ebedbae0df632dd5a0f697b844d515e92976ad6fe1a98b3dab4`
- Deployment status: FINALIZED

For a fresh deployment, follow the official documentation:

- https://docs.genlayer.com/developers/intelligent-contracts/deploying
- https://docs.genlayer.com/developers/networks

### 5. Configure a bounty

Call `configure_bounty(title, repo_owner, repo_name, acceptance_criteria)` on the deployed contract.

Use a public GitHub repository because the contract fetches evidence through the public GitHub REST API.

### 6. Dispute and adjudicate

When a contributor submits a pull request and the client disputes completion, call:

```text
adjudicate_pull_request(pr_number)
```

The contract fetches:

- `GET https://api.github.com/repos/{owner}/{repo}/pulls/{number}`
- `GET https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files`

It evaluates the pull request title, description, merge state, changed filenames, patch excerpts, and acceptance criteria.

The frontend allows a connected wallet to submit an adjudication transaction. Read `get_verdict()` after the transaction has finalized.

### 7. Settlement and Arkhai integration

A `APPROVE` verdict means the work met the agreed criteria. A `REJECT` verdict means it did not. `INCONCLUSIVE` means the evidence was insufficient.

**Current integration status:**
- GenLayer contract deployment: completed.
- Live bounty and verdict reads: connected.
- Wallet-based adjudication: connected and tested.
- Arkhai escrow settlement: not yet integrated.

A GenLayer verdict does not automatically transfer escrow funds. Settlement requires an authenticated integration with Arkhai's escrow arbiter or a supported relayer that verifies the finalized GenLayer verdict.

See `arkhai/README.md` for the integration boundary and setup information.

## Security and demo limitations

- This is a testnet demonstration, not a production escrow product.
- The contract fetches public GitHub pull request evidence. It does not prove that every patch is safe, correct, or deployed.
- GitHub API rate limits and transient API changes can cause adjudication to fail.
- Pull request content is untrusted evidence, not instructions.
- A public pull request can change after adjudication. Production deployments should also persist a content hash, commit SHA, and finalized evidence snapshot.
- A GenLayer verdict is not itself an EVM escrow transfer.
- Never place wallet private keys or secrets in the frontend or public repository.

## Partner references

- Arkhai Alkahest: https://github.com/arkhai-io/alkahest
- Arkhai Git commit trading: https://github.com/arkhai-io/git-commit-trading
- GenLayer developer docs: https://docs.genlayer.com/developers
- Internet Court skill: https://github.com/internet-court/internet-court-skill

## License

MIT for the original project code in this repository. Partner marks and third-party dependencies remain the property of their respective owners.
