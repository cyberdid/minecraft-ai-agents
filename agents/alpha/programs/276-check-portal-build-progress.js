// programs/276-check-portal-build-progress.js
console.log('=== Program 276: Check Portal Build Progress ===');
console.log('Time:', lib.time());

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

// Check portal frame missing materials at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame missing at (298, 72, -54):', JSON.stringify(mat.missing));

// Chat with team
bot.chat('beta: Beta, did you reach (298, 72, -54) to place obsidian? Delta & Gamma have food and beds ready!');
await sleep(3000);
