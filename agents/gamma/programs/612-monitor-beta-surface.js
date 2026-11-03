// programs/612-monitor-beta-surface.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== MONITOR BETA SURFACE ARRIVAL ===');

const start = Date.now();
while (Date.now() - start < 45000 && !isCancelled()) {
  const beta = bot.players.beta?.entity;
  const p1 = bot.blockAt(new Vec3(299, 73, -54));
  const sill = bot.blockAt(new Vec3(299, 72, -54));

  if (p1?.name === 'nether_portal') {
    console.log('PORTAL IS ACTIVELY LIT!');
    break;
  }

  if (beta) {
    console.log(`Beta at ${lib.fmt(beta.position)}, y=${beta.position.y.toFixed(1)}, held: ${beta.heldItem?.name}`);
    if (beta.position.y >= 70) {
      console.log('Beta is ON THE SURFACE!');
    }
  }

  if (sill?.name === 'obsidian') {
    console.log('Sill is obsidian! Ready for ignition!');
  } else if (sill?.name === 'lava') {
    console.log('Sill has lava!');
  }

  await sleep(2000);
}

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
}

return {
  betaY: bot.players.beta?.entity?.position?.y,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portal: bot.blockAt(new Vec3(299, 73, -54))?.name
};
