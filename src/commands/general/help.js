const moment = require("moment-timezone");
const axios = require("axios");

const replaceWithCustomFont = (sentence) => {
  const customFontMap = {
    a: '𝐚', b: '𝐛', c: '𝐜', d: '𝐝', e: '𝐞', f: '𝐟', g: '𝐠', h: '𝐡', i: '𝐢', j: '𝐣',
    k: '𝐤', l: '𝐥', m: '𝐦', n: '𝐧', o: '𝐨', p: '𝐩', q: '𝐪', r: '𝐫', s: '𝐬', t: '𝐭',
    u: '𝐮', v: '𝐯', w: '𝐰', x: '𝐱', y: '𝐲', z: '𝐳'
  };
  return sentence.split(' ').map(word =>
    word.split('').map(letter =>
      customFontMap[letter.toLowerCase()] || letter
    ).join('')
  ).join(' ');
};

module.exports = {
  name: 'help',
  aliases: ['h', 'menu', 'list'],
  category: 'general',
  react: "🏹",
  cool: 20,
  description: 'Displays the command list or specific command info',
  async execute(client, arg, M) {
    const thumbnailUrls = [
      'https://telegra.ph/file/696d57ab7da60785da604.jpg',
      'https://telegra.ph/file/b1a1fda49ed556f2d89ef.jpg',
      'https://telegra.ph/file/8134328382431189937e0.jpg',
      'https://telegra.ph/file/6a1d8bb62428b85b20879.jpg',
      'https://telegra.ph/file/584c6fcafb36f00dafccd.jpg',
      'https://telegra.ph/file/09eeb2d88ae7b01ee2d22.jpg',
      'https://telegra.ph/file/bb4eb58c1a55ec72b70f4.jpg',
      'https://telegra.ph/file/e09d411bd2aa8bdfb90fa.jpg',
      'https://telegra.ph/file/e7ed2722c592d16d6432e.jpg',
      'https://telegra.ph/file/597c2f786af9a94c482cd.jpg'
    ];

    const getRandomThumbnailUrl = () => {
      return thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)];
    };

    const now = new Date();
    const hour = now.getHours();
    let greeting = hour < 12 ? "🌄 Good Morning" : hour < 18 ? "⛱️ Good Afternoon" : "🌃 Good Evening";

    try {
      if (!arg) {
        let pushName = M.pushName.trim();
        if (pushName.split(' ').length === 1) pushName = `${pushName},`;

        const categories = client.cmd.reduce((obj, cmd) => {
          const category = cmd.category || 'Uncategorized';
          if (['rpg', 'card game', 'nsfw'].includes(category)) return obj;
          obj[category] = obj[category] || [];
          obj[category].push(cmd.name);
          return obj;
        }, {});

        const emojis = ['🃏' , '🎰' , '🧠', '🕺' , '⛩️' , '🎵' , '👑' , '⛏️', '⛩️']   ;
        const commandList = Object.keys(categories);
        let commands = "";

        for (const category of commandList) {
          const emoji = emojis[commandList.indexOf(category)] || '📁';
          commands += `*${client.utils.capitalize(category, true)} ${emoji}  ⟾*\n`;
          commands += `\`\`\`${categories[category].join(' ❀︎ ')}\`\`\`\n\n`;
        }

        const date = moment.tz('Africa/Harare').format('DD/MM/YYYY');
        const time = moment().format('HH:mm:ss');

        let helpText = `╭──≽「 *${greeting}* 」\n│\n│  👤 *User:* ${pushName}\n│  📅 *Date:* ${date}\n│  ⏰ *Time:* ${time}\n╰──────≽\n\n`;
        helpText += `🌟 This menu helps you get started with the bot.\n\n*▬๑۩  『 Command_List 』  ۩๑▬*\n\n`;
        helpText += commands;
        helpText += `💠 Thank you for using me. Share me with friends & leave a review!`;

        await client.sendMessage(
          M.from,
          {
            text: replaceWithCustomFont(helpText)
          },
          { quoted: M }
        );
        return;
      }

      const command = client.cmd.get(arg) || client.cmd.find((cmd) => cmd.aliases && cmd.aliases.includes(arg));
      if (!command) return M.reply('❌ Command not found.');

      let detailedMessage = `📝 *Command Info*\n\n📌 Name: ${command.name}\n🔁 Aliases: ${command.aliases.join(', ')}\n📖 Description: ${command.description}`;
      M.reply(replaceWithCustomFont(detailedMessage));

    } catch (err) {
      await client.sendMessage(
        M.from,
        {
          image: { url: `${client.utils.errorChan()}` },
          caption: `${client.utils.greetings()} Error-Chan Dis\n\n⚠️ Error:\n${err}`
        }
      );
    }
  }
};
