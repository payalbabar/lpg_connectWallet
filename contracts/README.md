# GasChain Smart Contracts 🏗️

This folder contains the Soroban (Rust) smart contracts for the GasChain ecosystem. These contracts provide on-chain validation for LPG cylinder bookings on the Stellar Network.

## Contracts

### ⛽ `gas_chain`
The main contract responsible for:
- Initializing bookings with cryptographic verification.
- Validating cylinder distribution steps.
- Recording delivery events on the immutable ledger.

## Development

### Prerequisites
- [Rust](https://www.rust-lang.org/)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)
- Target: `wasm32-unknown-unknown`

### Build
```bash
cd gas_chain
cargo build --target wasm32-unknown-unknown --release
```

### Test
```bash
cargo test
```

## Security
For detailed security considerations regarding the smart contracts, please refer to the root [SECURITY_CHECKLIST.md](../SECURITY_CHECKLIST.md).
