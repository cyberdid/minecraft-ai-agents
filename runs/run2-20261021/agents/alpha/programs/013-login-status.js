console.log('Logging back in and assessing surroundings...');
const pos = bot.entity.position;
console.log(`Current pos: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`);
console.log(`Inventory:`, Object.entries(lib.inventory()).map(([k,v]) => `${k}x${v}`).join(', '));
await lib.chat('Hey beta, house structure is complete! I am going to gather some wood/coal/cobble for torches, furnace and chest.');
return { pos, inv: lib.inventory() };
