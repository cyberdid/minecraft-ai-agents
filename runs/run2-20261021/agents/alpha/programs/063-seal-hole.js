console.log('Digging 1 more down so head is completely underground');
const bx = 16;
const bz = -23;
await lib.dig(bx, 63, bz);
await sleep(300);
console.log('Now at:', bot.entity.position);

// Now place roof at y=66 or y=65 to seal completely
// Check if we can place sand at (16, 65, -23)
const sandItem = bot.inventory.items().find(i => i.name === 'sand');
if (sandItem) {
  await bot.equip(sandItem, 'hand');
  // place against (16, 65, -22) or (16, 65, -24) if solid wall exists
  const ref = lib.blockAt(16, 65, -24) || lib.blockAt(17, 65, -23);
  if (ref && ref.name !== 'air') {
    console.log('Placing overhead seal against:', ref.name, 'at', ref.position);
    await bot.placeBlock(ref, new Vec3(ref.position.x === 16 ? 0 : -1, 0, ref.position.z === -23 ? 0 : 1));
  }
}
console.log('Shelter sealed check: block above at (16, 65, -23):', lib.blockAt(16, 65, -23)?.name);
console.log('Time of day:', lib.time());
