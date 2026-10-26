// programs/318-check-team-and-portal-status.js
console.log('=== Program 318: Check Team & Portal ===');

for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} not nearby`);
  }
}

// Check portal frame at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame missing:', JSON.stringify(mat.missing));

// Withdraw 32 cobblestone from base chest to carry emergency blocks
try {
  await lib.withdraw({ cobblestone: 32 }, 293, 72, -57);
  console.log('Withdrew 32 cobblestone! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Withdraw note:', e.message);
}

bot.chat('delta: Delta/Beta, are you coming up the shaft stairs? Portal frame at (298, 72, -54) is ready for the 10 obsidian!');
