console.log('Safe inside sealed underground hole during night.');
console.log('Status: alpha at', bot.entity.position);
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16:', hostiles.length);

const t = lib.time();
console.log('Time of day:', t.timeOfDay, 'Phase:', t.phase);
return { pos: bot.entity.position, hostiles, time: t };
