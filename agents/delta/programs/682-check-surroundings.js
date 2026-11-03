const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Nearby players:');
for (const p of players) {
  console.log(`- ${p.username}: at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && e.isValid);
console.log(`Piglins found: ${piglins.length}`);
for (const p of piglins) {
  console.log(`- piglin id=${p.id} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && e.isValid);
console.log(`Endermen found: ${endermen.length}`);
for (const e of endermen) {
  console.log(`- enderman id=${e.id} at ${lib.fmt(e.position)} (dist: ${bot.entity.position.distanceTo(e.position).toFixed(1)}m)`);
}

const hoglins = Object.values(bot.entities).filter(e => e.name === 'hoglin' && e.isValid);
console.log(`Hoglins found: ${hoglins.length}`);
for (const h of hoglins) {
  console.log(`- hoglin id=${h.id} at ${lib.fmt(h.position)} (dist: ${bot.entity.position.distanceTo(h.position).toFixed(1)}m)`);
}

console.log('My inventory:', lib.inv());
console.log('My equipment:', {
  head: bot.inventory.slots[5]?.name,
  torso: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name,
});
