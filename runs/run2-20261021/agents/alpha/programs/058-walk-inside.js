const pos = bot.entity.position;
console.log('Alpha at:', lib.fmt(pos));
// Walk directly to (13, 67, -24) or (12, 67, -23) inside the house
await lib.walkTo(12.5, -23.5);
console.log('Now at:', lib.fmt(bot.entity.position));

// Check ceiling and surrounding walls
console.log('Floor at (12, 66, -23):', lib.blockAt(12, 66, -23)?.name);
console.log('Roof above (12, 70, -23):', lib.blockAt(12, 70, -23)?.name);
console.log('Time until night:', lib.status().secondsUntilNight, 's');
