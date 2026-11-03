console.log('=== DELTA: STATUS & CHAT CHECK ===');
bot.chat('delta: Status check: team united in base. Checking for blaze_powder or ender_eye.');

for (const p of Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username)) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

console.log('Delta inventory:', lib.inv());
