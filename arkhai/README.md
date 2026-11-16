# Arkhai integration

GitBounty Court uses Arkhai's Git escrow workflow as the bounty / conditional settlement component. The official Arkhai Git escrow tooling is published at:

- https://github.com/arkhai-io/git-commit-trading
- Alkahest escrow SDK and contracts: https://github.com/arkhai-io/alkahest

The upstream Git escrow skill describes `git-escrows submit` as the workflow for creating a token-reward bounty against a test suite. Install and configure the official CLI using its current README and `--help` output:

```bash
npm install -g git-escrows
git-escrows --help
git-escrows submit --help
```

**Do not guess flags or paste private keys into this repository.** CLI options, supported chains, token addresses and escrow contracts must be taken from the current upstream release.

For the demo, create a small public repository with one intentionally failing test or a clearly defined coding task. Create the bounty with Arkhai and record:
- escrow identifier
- network / chain
- token and amount
- creator and claimant addresses
- creation transaction hash
- configured arbiter / fulfillment condition

## Settlement boundary

The GenLayer contract is deployed on Bradbury; Alkahest / Git escrow operates on an EVM network supported by Arkhai. A GenLayer verdict does not automatically execute an EVM transfer. For a production-grade automatic bridge, implement an authenticated relay / attestation that verifies the finalized GenLayer transaction and feeds the verdict into an Alkahest arbiter that was configured at escrow creation.

Until that relay/arbiter is deployed and tested, settlement is an explicit operator step through the official Arkhai workflow after independently verifying the finalized GenLayer verdict. This is intentional: it avoids claiming cross-chain atomicity that the demo does not yet provide.
