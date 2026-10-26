// programs/289-check-team-and-portal.js
console.log('=== Program 289: Status Check on Team & Portal ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'hp:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} entity not nearby`);
  }
}

// Portal frame status at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal missing at (298, 72, -54):', JSON.stringify(mat.missing));

// Check if nether_portal block exists inside portal
const inside1 = bot.blockAt(new Vec3(299, 73, -54));
const inside2 = bot.blockAt(new Vec3(300, 73, -54));
console.log('Inside blocks:', inside1?.name, inside2?.name);

bot.chat('team: Alpha online! Beta, did you reach the portal site?');
