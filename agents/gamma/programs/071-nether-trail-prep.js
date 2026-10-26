// programs/071-nether-trail-prep.js
console.log('--- NETHER BUNKER SETUP & PATH SCOUT ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);

// 1. Craft planks, crafting table, chest
if (lib.count('*_planks') < 12 && lib.count('birch_log') >= 3) {
  await lib.craft('birch_planks', 12);
}
if (!lib.count('crafting_table') && lib.count('*_planks') >= 4) {
  console.log('Crafting crafting_table...');
  await lib.craft('crafting_table', 1);
}
if (!lib.count('chest') && lib.count('*_planks') >= 8) {
  console.log('Crafting chest...');
  await lib.craft('chest', 1);
}

console.log('Inv after craft:', JSON.stringify(lib.inv()));

// 2. Look for placement spots inside or right next to bunker
const p = bot.entity.position.floored();
console.log('Finding solid placement spot for table/chest...');
let placedTable = false;
let placedChest = false;

for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const target = p.offset(dx, 0, dz);
    const below = bot.blockAt(target.offset(0, -1, 0));
    const block = bot.blockAt(target);
    const above = bot.blockAt(target.offset(0, 1, 0));
    
    // Check if target is air, ground is solid, and not portal
    if (block && (block.name === 'air' || block.name === 'cave_air') && 
        below && below.boundingBox === 'block' && below.name !== 'nether_portal') {
      if (!placedTable && lib.count('crafting_table') > 0) {
        console.log(`Placing crafting table at ${lib.fmt(target)}...`);
        try {
          await lib.place('crafting_table', target.x, target.y, target.z);
          placedTable = true;
          continue;
        } catch (e) {
          console.log('Place table failed:', e.message);
        }
      }
      if (!placedChest && lib.count('chest') > 0) {
        console.log(`Placing chest at ${lib.fmt(target)}...`);
        try {
          await lib.place('chest', target.x, target.y, target.z);
          placedChest = true;
          continue;
        } catch (e) {
          console.log('Place chest failed:', e.message);
        }
      }
    }
  }
}

// 3. Check players in Nether
for (const [name, player] of Object.entries(bot.players)) {
  if (name !== 'gamma' && player.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(player.entity.position)}`);
  }
}

// 4. Report status
bot.chat(`gamma set up Nether bunker: table=${placedTable}, chest=${placedChest}. Ready to link trail to Fortress (45, 53, -116)!`);
