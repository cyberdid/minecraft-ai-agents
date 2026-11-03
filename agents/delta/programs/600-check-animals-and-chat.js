console.log('=== CHECK ANIMALS & CHAT ===');
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob');
console.log(`Found ${mobs.length} mobs total:`);
for (const m of mobs) {
  const dist = bot.entity.position.distanceTo(m.position);
  if (dist < 64) {
    console.log(`  ${m.name} at ${lib.fmt(m.position)} (dist ${dist.toFixed(1)})`);
  }
}
