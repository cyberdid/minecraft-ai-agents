// programs/059-check-base-storage.js
// Check contents of nearest chest and furnace(s), and craft/place 2 extra furnaces if needed

console.log('Position:', lib.fmt(bot.entity.position));
const chest = await lib.chestContents();
console.log('Chest contents:', JSON.stringify(chest));

const furnacePos = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const p of furnacePos) {
  const b = bot.blockAt(p);
  console.log(`Block at ${p}: ${b ? b.name : 'null'}`);
}

const inv = lib.inv();
console.log('Alpha inventory:', JSON.stringify(inv));
