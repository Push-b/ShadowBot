module.exports = {
  name: 'report',
  aliases: ['report'],
  category: 'general',
  react: "✅",
  description: 'Reports user issues',

  async execute(client, arg, M) {

    const videos = [
      'https://telegra.ph/file/f0c24da2961de0bede5e1.mp4',
      'https://telegra.ph/file/f7d87038dc8c486c1a094.mp4',
      'https://telegra.ph/file/672375c8205e1f126f200.mp4'
    ];

    const ariLogo = "https://telegra.ph/file/e31dd504c161712abeeb2.jpg";

    let user = M.sender;
    let tr = arg || "No message provided.";
    
    let report = `┏━[ *📢 𝗥𝗘𝗣𝗢𝗥𝗧 𝗥𝗘𝗖𝗘𝗜𝗩𝗘𝗗* ]━┓\n\n` +
                 `👤 *Sender:* ${user}\n` +
                 `📝 *Message:* ${tr}\n\n` +
                 `┗━━━━━━━━┛`;

    let replyText = `✅ Your report has been forwarded to the mods group. Please be patient.`;

    await client.sendMessage("120363305285331029@g.us", {
      text: report
    }, { quoted: M });

    await client.sendMessage(M.from, {
      text: replyText
    }, { quoted: M });
  }
}
