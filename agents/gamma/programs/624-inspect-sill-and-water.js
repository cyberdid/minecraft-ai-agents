// programs/624-inspect-sill-and-water.js
console.log('=== INSPECT SILL AND WATER ===');
const b71 = bot.blockAt(new Vec3(299, 71, -54));
const b72 = bot.blockAt(new Vec3(299, 72, -54));
const b73 = bot.blockAt(new Vec3(299, 73, -54));
const b74 = bot.blockAt(new Vec3(299, 74, -54));
console.log('(299, 71, -54):', b71?.name);
console.log('(299, 72, -54):', b72?.name);
console.log('(299, 73, -54):', b73?.name);
console.log('(299, 74, -54):', b74?.name);

const b300_72 = bot.blockAt(new Vec3(300, 72, -54));
const b300_73 = bot.blockAt(new Vec3(300, 73, -54));
console.log('(300, 72, -54):', b300_72?.name);
console.log('(300, 73, -54):', b300_73?.name);

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}
