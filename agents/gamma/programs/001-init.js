// programs/001-init.js
bot.chat("gamma online: starting supply and gear run!");
const st = lib.status();
const logs = lib.find('*_log', { maxDistance: 32, count: 5 }).map(b => ({ name: b.name, pos: lib.fmt(b.position) }));
const cows = bot.nearestEntity(e => e.name === 'cow' || e.name === 'sheep' || e.name === 'pig');
console.log('gamma pos:', lib.fmt(st.pos), 'time:', st.phase, 'night in:', st.secondsUntilNight);
console.log('nearby trees:', logs);
console.log('nearest animal:', cows ? `${cows.name} at ${lib.fmt(cows.position)}` : 'none');
return { pos: st.pos, time: st.timeOfDay, nightIn: st.secondsUntilNight };
