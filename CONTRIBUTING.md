# Contributing to ForgeFlow

This is a weekend hackathon project (Solana Blitz v5).

## Philosophy
- Professional from the first line of code.
- Deep, correct use of MagicBlock Ephemeral Rollups + FlashTrade.
- Excellent user experience and clear communication of the novel tech.

## Development
- Use the VPS-friendly scripts (`npm run test:flow`, `npm run simulate-strategy` if added).
- Prefer small, well-commented PRs.
- Update relevant docs when changing integration points.

## Code Quality Bar (for this repo)
- Clear separation between base Solana and ER execution paths.
- FlashTrade interactions go through the dedicated lib.
- UI components are small and focused.
- Error messages and logging help future debuggers (including judges).

Happy building — let's ship something that stands out.
