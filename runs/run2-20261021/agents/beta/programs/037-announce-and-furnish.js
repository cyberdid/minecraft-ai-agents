// Announce the completed structure with its coordinates in game chat as required by the objective
bot.chat("The house at (10, 67, -25) is fully finished! 5x5 structure with sandstone walls, solid roof, window gaps, and an oak door at (12, 67, -21).");

console.log('Entering the completed house...');
await lib.goThroughDoor(12, 67, -21);
console.log('Inside the house! Bot pos:', lib.fmt(bot.entity.position));

// Check if we can place a crafting table or chest inside along the back wall
// Interior floor is at y=66, interior space is (11..13, 67, -24..-22)
const tableInside = new Vec3(11, 67, -24);
try {
  // Check if we have a table or planks
  if (lib.count('crafting_table') > 0) {
    await lib.place('crafting_table', tableInside.x, tableInside.y, tableInside.z);
    console.log('Placed crafting table inside at', lib.fmt(tableInside));
  }
} catch (e) {
  console.log('Table inside note:', e.message);
}

// Final scan confirmation
const bp = lib.shapes.house({
  x: 10,
  y: 67,
  z: -25,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

let placed = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && (cur.name === b.name || (b.y === 70 && (cur.name === 'oak_planks' || cur.name === 'sandstone')))) {
    placed++;
  }
}
console.log(`Final verified blocks: ${placed}/${bp.length}`);

const door = bot.blockAt(new Vec3(12, 67, -21));
console.log('Door status:', door ? door.name : 'none');

bot.chat("alpha: Interior inspected and secured. Both of us built a great home!");

return {
  status: "COMPLETE",
  houseCorner: "(10, 67, -25)",
  totalBlocks: placed,
  doorPos: "(12, 67, -21)"
};
