module.exports = {
  name: 'stalk',
  aliases: ['stalknumber'],
  category: 'general',
  react: "✅",
  description: 'Scans for active WhatsApp numbers in a provided pattern range (e.g., 263788671xxx)',

  async execute(client, arg, M) {
    if (!arg) return M.reply(`Usage: ${client.prefix}stalk 263788671xxx (only up to 3 'x')`);

    const inputNumber = arg.trim();
    const xCount = (inputNumber.match(/x/g) || []).length;

    if (!inputNumber.includes('x')) return M.reply("⚠️ Error: Missing 'x' in the number pattern.");
    if (xCount > 3) return M.reply("❌ Maximum of 3 'x' allowed!");

    await M.reply("🔍 Searching for WhatsApp accounts in the given range...\n⏳ This may take 5 minutes, please be patient.");

    const fixedPart = inputNumber.replace(/x/g, '');
    const placeholders = Math.pow(10, xCount);
    let found = `*📱 WhatsApp Numbers Found:*\n\n`;
    let noBio = `\n*🗒️ Numbers With No Bio:*\n\n`;
    let notFound = `\n*🚫 No WhatsApp Found:*\n\n`;

    for (let i = 0; i < placeholders; i++) {
      const suffix = i.toString().padStart(xCount, '0');
      const fullNumber = inputNumber.replace(/x{1,3}/, suffix);
      const jid = `${fullNumber}@s.whatsapp.net`;

      try {
        const exists = await client.onWhatsApp(jid);
        if (!exists || !exists[0]?.jid) {
          notFound += `${fullNumber}\n`;
          continue;
        }

        let status;
        try {
          status = await client.fetchStatus(jid);
        } catch {
          status = null;
        }

        const cleanNumber = exists[0].jid.split('@')[0];
        if (!status || !status.status?.length) {
          noBio += `wa.me/${cleanNumber}\n`;
        } else {
          found += `*Number:* wa.me/${cleanNumber}\n*Bio:* ${status.status}\n\n`;
        }

      } catch (e) {
        notFound += `${fullNumber}\n`;
      }
    }

    const finalReport = `${found || ''}${noBio || ''}${notFound || ''}`.trim();
    await client.sendMessage(M.from, { text: finalReport }, { quoted: M });
  },
};
