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
- GenLayer Studio or the matching GenLayer CLI / SDK release
- A funded testnet wallet for Bradbury deployment and transactions
- GitHub public repository and pull request for evidence
- Arkhai's official `git-commit-trading` / `git-escrows` tooling and a supported EVM test network for escrow
- Node.js is optional for serving the static demo

### 2. Validate the contract source locally

```bash
python scripts/validate_contract.py
python -m unittest discover -s tests -v
```

These checks validate the source shape only. They do not compile or deploy the contract.

### 3. Deploy the Intelligent Contract

Open https://studio.genlayer.com/ or use the current GenLayer CLI workflow. For a real Bradbury deployment, follow the current official deployment guide and use a Phase-2-compatible GenLayer node RPC (not only the underlying chain RPC):
- https://docs.genlayer.com/developers/intelligent-contracts/deploying
- https://docs.genlayer.com/developers/networks

The current official docs distinguish the GenLayer node RPC (`gen_*` intelligent-contract operations) from the underlying chain RPC (`eth_*` operations). Bradbury chain RPC alone is not sufficient for Intelligent Contract calls.

**Studio schema troubleshooting:** first compile and run the contract on the stable environment supported by the current Studio release. Do not add an unverified dependency hash. Use the exact dependency metadata and runtime version documented by the current GenLayer release you are targeting.

After deployment, record:
- network name and chain ID
- contract address
- deployment transaction hash
- finalized execution result (not merely transaction finality)

### 4. Configure a bounty

Call `configure_bounty(title, repo_owner, repo_name, acceptance_criteria)` on the deployed contract. Use a public GitHub repository because the contract fetches the unauthenticated public GitHub REST API.

### 5. Open the Arkhai escrow

Follow Arkhai's official Git escrow instructions in `arkhai/README.md`. Save the escrow identifier, chain, token, amount, and creation transaction in your deal notes. Never paste a private key into the frontend or repository.

### 6. Dispute and adjudicate

When the contributor submits a PR and the client disputes completion, call:

```text
adjudicate_pull_request(pr_number)
```

The contract fetches:
- `GET https://api.github.com/repos/{owner}/{repo}/pulls/{number}`
- `GET https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files`

It evaluates the title, description, merge state, changed filenames, patch excerpts and acceptance criteria. It records a structured verdict as a string. Read `get_verdict()` after the transaction has finalized successfully.

### 7. Settlement

A `APPROVE` verdict means the work met the rubric; a `REJECT` verdict means it did not; `INCONCLUSIVE` means evidence was insufficient. Settlement must be executed through the Arkhai escrow's configured arbiter/fulfillment path. For a fully automatic cross-chain demo, implement and test an authenticated relayer or supported Alkahest arbiter that consumes the finalized GenLayer verdict. Do not treat a browser-provided verdict as authority.

## Security and demo limitations

- This is a testnet demo, not a production escrow product.
- The contract only fetches public GitHub PR evidence. It does not prove that every patch is safe, correct, or deployed.
- GitHub API rate limits and transient API changes can cause adjudication to fail; retry only after checking the failed transaction receipt.
- PR content is untrusted input. The prompt explicitly treats it as evidence, not instructions.
- A public PR can change after adjudication. The contract stores the PR number and verdict; for production, also persist a content hash / commit SHA and a finalized evidence snapshot.
- A GenLayer verdict is not itself an EVM escrow transfer. Cross-chain settlement requires a verifiable bridge/attestation/relayer or an Arkhai arbiter that can verify the verdict.
- The demo UI is a visual prototype and must not be described as connected to live contracts until configured.

## Partner references

- Arkhai Alkahest: https://github.com/arkhai-io/alkahest
- Arkhai Git commit trading: https://github.com/arkhai-io/git-commit-trading
- GenLayer developer docs: https://docs.genlayer.com/developers
- Internet Court skill: https://github.com/internet-court/internet-court-skill

## License

MIT for the original project code in this repository. Partner marks and third-party dependencies remain the property of their respective owners.
