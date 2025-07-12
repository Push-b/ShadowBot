module.exports = {
  name: 'bots',
  aliases: ['bots'],
  category: 'general',
  react: 'ℹ️',
  description: 'Displays the bots with status info',
  async execute(client, arg, M) {
    if (!client.bots?.length) return M.reply('🔴 *No bots are currently configured.*');

    let botList = `╭─〔 *🤖 Kurumi Bots Status Panel* 〕\n│\n`;
    let count = 1;

    for (let bot of client.bots) {
      const jid = `${bot}@s.whatsapp.net`;
      const contact = await client.contact.getContact(jid, client);
      const username = contact.username || contact.notify || 'Unknown';
      const phone = jid.split('@')[0];

      // Check online/offline presence
      let presence;
      try {
        const lastPresence = await client.presence.getPresence(jid);
        presence = lastPresence?.lastSeen
          ? `🟡 *Last seen:* ${new Date(lastPresence.lastSeen).toLocaleTimeString()}`
          : lastPresence?.isOnline
          ? '🟢 *Online now*'
          : '🔴 *Offline*';
      } catch (err) {
        presence = '⚪ *Presence Unknown*';
      }

      botList += `├─ 🆔 *Bot #${count}*\n`;
      botList += `│   • 👤 *Name:* ${username}\n`;
      botList += `│   • 📞 *Contact:* https://wa.me/${phone}\n`;
      botList += `│   • 📶 *Status:* ${presence}\n│\n`;
      count++;
    }

    botList += '╰─ End of List';

    await client.sendMessage(M.from, {
      text: botList,
      mentions: client.bots.map(bot => `${bot}@s.whatsapp.net`)
    }, { quoted: M });
  }
};
