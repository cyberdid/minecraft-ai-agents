// programs/609-track-beta-ascent.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== TRACK BETA ASCENT & LAVA ===');

const start = Date.now();
while (Date.now() - start < 45000 && !isCancelled()) {
  const beta = bot.players.beta?.entity;
  const p1 = bot.blockAt(new Vec3(299, 73, -54));
  const sill = bot.blockAt(new Vec3(299, 72, -54));

  if (p1?.name === 'nether_portal') {
    console.log('NETHER PORTAL IS LIT!');
    break;
  }

  if (beta) {
    console.log(`Beta at ${lib.fmt(beta.position)}, held: ${beta.heldItem?.name}`);
    if (beta.position.y > 60) {
      console.log('Beta has ascended to the surface!');
    }
  }

  if (sill?.name === 'obsidian') {
    console.log('Sill is obsidian! Ready for ignition!');
  } else if (sill?.name === 'lava') {
    console.log('Sill has lava!');
  }

  await sleep(2500);
}

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
}

return {
  betaPos: bot.players.beta?.entity?.position,
  betaHeld: bot.players.beta?.entity?.heldItem?.name,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portal: bot.blockAt(new Vec3(299, 73, -54))?.name
};
