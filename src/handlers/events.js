module.exports = EventsHandler = async (event, client) => {
    const activateEvents = (await client.DB.get('events')) || [];
    const groupMetadata = await client.groupMetadata(event.id);
    if (!activateEvents.includes(event.id)) return;

    const getRandomMessage = (action, participants) => {
        const userTags = participants.map(jid => `@${jid.split('@')[0]}`).join(' ');
        const user = `@${participants[0].split('@')[0]}`;
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'No description available';

        const messages = {
            add: [
                `╭━━⊱ *Welcome Aboard!* ⊰━━╮\n` +
                `  ✨ *Group:* ${groupName}\n` +
                `  📜 *About:* ${groupDesc}\n\n` +
                `  🗽 *Welcome:* ${userTags}`,
            ],
            remove: [
                
                `┃ 👋 So long, ${user}... we probably wont miss you`,
            ],
            demote: [
                `┌──『 ⚠️ ADMIN DOWN 』─┐\n` +
                ` ${user} has been *demoted*\n` +
                ` Better luck next time, commander.\n` +,
            ],
            promote: [
                `┏━━『 👑 NEW ADMIN 』━━┓\n` +
                ` 🎉 ${user} just leveled up!\n` +
                ` 🔧 Welcome to the control panel.`,
            ],
        };

        const chosen = messages[action];
        if (!chosen) return '';
        return chosen[Math.floor(Math.random() * chosen.length)];
    };

    const text = getRandomMessage(event.action, event.participants);

    if (text) {
        await client.sendMessage(event.id, {
            text,
            mentions: event.participants,
        });
    }
};
