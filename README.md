# GasChain ⛽⛓️

[![CI/CD Pipeline](https://github.com/payalbabar/lpg_connectWallet/actions/workflows/ci.yml/badge.svg)](https://github.com/payalbabar/lpg_connectWallet/actions)


Blockchain-powered LPG cylinder management system. This application provides a transparent, immutable ledger for tracking bookings, supply chains, and government subsidies on the Stellar Network.


## Features 🚀

- **Smart Booking**: Secure LPG booking with automatic subsidy application.
- **Blockchain Supply Chain**: Immutable tracking of every cylinder from distribution to delivery.
- **Subsidy Management**: Real-time tracking of government subsidies on the blockchain.
- **Immutable Ledger**: Full exploration of all blockchain blocks and transaction history.
- **Rich Dashboard**: Overview of system activity with dynamic stats and recent blocks.

## Screenshots 📸

<img width="1920" height="1080" alt="Screenshot 2026-04-20 174658" src="https://github.com/user-attachments/assets/4c12520c-0e6e-48e3-be67-3687531bd5c6" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 174638" src="https://github.com/user-attachments/assets/dc34e62f-bf3b-4654-869e-0c782b93cb4a" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 174552" src="https://github.com/user-attachments/assets/1ca4065d-6e5a-4283-8a57-1c4e2ead74dc" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 173343" src="https://github.com/user-attachments/assets/1f812def-9341-47c1-bf50-02d71354941b" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 173323" src="https://github.com/user-attachments/assets/68c39d28-3c08-4345-823a-5d88dc87a9ac" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 173309" src="https://github.com/user-attachments/assets/316b96d0-a4d8-48f6-afcc-9a0bcdb97034" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 173300" src="https://github.com/user-attachments/assets/8b24de78-b4e0-4f75-8bbf-73ad896ae373" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 173252" src="https://github.com/user-attachments/assets/56cc50f7-0895-4fa7-8594-a502f0bdee78" />
<img width="1920" height="1080" alt="Screenshot 2026-04-20 173232" src="https://github.com/user-attachments/assets/b345e54a-e4f8-4158-a42f-d2297fc3de93" />




## Tech Stack 🛠️

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend / DB**: Base44 SDK (Simulated Blockchain Entities)
- **Icons**: Lucide React
- **Fonts**: Inter & JetBrains Mono

## Project Structure 🏗️

- **`/src`**: Frontend React application logic.
- **[`/contracts`](./contracts)**: Soroban (Rust) smart contracts for on-chain booking validation.
- **`.github/workflows`**: Automated CI/CD pipeline using GitHub Actions.


## Getting Started 🏁

### 🌟 Project Demo & Links
- **Live Demo**: [https://lpg-connect-wallet.vercel.app/](https://lpg-connect-wallet.vercel.app/)
- **Demo Video**: [https://youtu.be/xtzdsvQu-Ew](https://youtu.be/xtzdsvQu-Ew)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Configure Environment**:
   Create a `.env` file with your Base44 App ID:
   ```env
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
   ```

## Design System 🎨

The app uses a modern "Glassmorphism" aesthetic with a dark sidebar and a clean, vibrant content area. It prioritizes readability and "Blockchain" feel using JetBrains Mono for hashes and IDs.

## User Validation & Feedback 📊

As part of validating our MVP, we collected feedback from real testnet users via [this Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeEEkw9WKm8rf73X4fk0EcvWSQWT8G3TvID-9w_82UFZOEj2w/viewform?usp=publish-editor). 
You can view the raw exported responses and feedback analysis in our Excel sheet below:

- **[View User Feedback (Excel Sheet) 🔗](https://docs.google.com/spreadsheets/d/1EUd0swodawwLFv8Btvce9rkJ55qmvpYR-9wI3NWukZw/edit?usp=sharing)**


### 👥 Testnet User Validations
To validate our real-world MVP, we tested the platform with 5+ real testnet users using Freighter wallets. Here are their verified Stellar wallet addresses:
1. `GCCKKVQS54JRCSTB64AQEQTMNVQBJ7JDDTP7US7ESBXIAQPMNL3P23F5`
2. `GDUFDJ23MIR2KR6FC3VTKA7YTCLJAJY5GL2UIX35HCFCZUPJCW7ZT6K5`
3. `GBKMNSFTMO5ZLC3TATXXFRC4QUOKD6ERTDWHQCXVB62KSELKG6QAWUJJ`
4. `GCHB2KGFMWFAM7HOQYUFNPQXAQMAY6U7OLXAP4BEJWIJWXBV6IDKB7DR`
5. `GDBIJBJQKTW3QCTAYL6KFNS2HHNSI3G7BI4AYORHAUIM5MZGOXQKULGN`

### MVP Iteration & Future Improvements 🛠️

Based on the initial user feedback, we've planned and started implementing key improvements. Here is our first completed iteration directly requested by users:

**Iteration 1: Wallet Connection UX Improvement**
*Feedback*: Users felt anxious during the wallet connection phase because there was no visual feedback that a background request was happening.
*Improvement*: Added dynamic loading states and spinners to the "Connect Wallet" button on the Landing Page.
- **[View Git Commit for this Iteration](https://github.com/payalbabar/lpg_connectWallet/commit/a4bf2c1db2a343d22c584a5527aef92f2041f60e)**


**Future Roadmap Based on User Feedback:**
- **Enhanced Payment Tracking**: Users want to see XLM transaction links directly in the dashboard after booking.
- **Onboarding Tooltips**: 2 users suggested that first-time onboarding for Freighter wallet should have a guided "How to Connect" modal.
