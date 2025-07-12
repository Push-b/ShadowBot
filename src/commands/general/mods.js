module.exports = {
  name: 'mods',
  aliases: ['modlist'],
  category: 'general',
  react: 'ℹ️',
  description: 'Displays the list of current mods',
  async execute(client, arg, M) {
    if (!client.mods || !client.mods.length) {
      return M.reply('🔴 *No mods available*');
    }

    let modList = '🛡️ *Current Mods* 🛡️\n\n';
    const mentions = [];

    for (const mod of client.mods) {
      const jid = `${mod}@s.whatsapp.net`;
      let contact;

      try {
        contact = await client.contact.getContact(jid, client);
      } catch (e) {
        contact = { username: mod };
      }

      const displayName = contact?.username || mod;
      modList += `@${displayName}\n`;
      mentions.push(jid);
    }

    await client.sendMessage(M.from, {
      text: modList,
      mentions
    });
  }
};



