module.exports = {
    name: 'kurumi',
    aliases: ['kurumi'],
    category: 'general',
    react: "✅",
    description: 'Bot faq',
    async execute(client, arg, M) {

        const thumbnailUrls = [
            'https://telegra.ph/file/2c6987dc8fe7294d67b9c.jpg',
            'https://telegra.ph/file/d32c66fe476f7acf3370a.jpg',
            'https://telegra.ph/file/77fe6725241b79e73c3ea.jpg',
            'https://telegra.ph/file/7a71e4adb3de99ac6d2a2.jpg',
            'https://telegra.ph/file/f2ae666c7a3f408e76f66.jpg',
        ];

        function getRandomThumbnailUrl() {
            const randomIndex = Math.floor(Math.random() * thumbnailUrls.length);
            return thumbnailUrls[randomIndex];
        }

        const thumbnailUrl = getRandomThumbnailUrl();

        let caption = `
╭━━━༺ 𝐊𝐔𝐑𝐔𝐌𝐈 𝐅𝐀𝐐 ༻━━━╮

👤 *Q1:* 𝐇𝐨𝐰 𝐭𝐨 𝐩𝐥𝐚𝐲 𝐜𝐚𝐫𝐝 𝐠𝐚𝐦𝐞 𝐢𝐧 𝐜𝐚𝐬𝐢𝐧𝐨?
🤖 *A:* 𝐀𝐧 𝐚𝐧𝐢𝐦𝐞 𝐜𝐚𝐫𝐝 𝐬𝐩𝐚𝐰𝐧𝐬 𝐫𝐚𝐧𝐝𝐨𝐦𝐥𝐲. 𝐔𝐬𝐞 𝐲𝐨𝐮𝐫 𝐞𝐜𝐨𝐧𝐨𝐦𝐲 𝐦𝐨𝐧𝐞𝐲 𝐭𝐨 𝐜𝐥𝐚𝐢𝐦.

👤 *Q2:* 𝐇𝐨𝐰 𝐝𝐨 𝐈 𝐚𝐝𝐝 ${client.prefix}𝐛𝐨𝐭 𝐢𝐧 𝐦𝐲 𝐠𝐫𝐨𝐮𝐩?
🤖 *A:* 𝐒𝐞𝐧𝐝 𝐲𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫'𝐬 𝐃𝐌.

👤 *Q3:* 𝐖𝐡𝐚𝐭 𝐚𝐫𝐞 𝐭𝐡𝐞 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐦𝐞𝐧𝐭𝐬 𝐭𝐨 𝐣𝐨𝐢𝐧 𝐠𝐫𝐨𝐮𝐩?
🤖 *A:* 𝐌𝐢𝐧𝐢𝐦𝐮𝐦 𝟓𝟎 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 + 𝐚𝐜𝐭𝐢𝐯𝐞 𝐜𝐡𝐚𝐭.

👤 *Q4:* 𝐇𝐨𝐰 𝐝𝐨 𝐈 𝐞𝐚𝐫𝐧 𝐗𝐏?
🤖 *A:* 𝐔𝐬𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐫𝐞𝐪𝐮𝐞𝐧𝐭𝐥𝐲, 𝐞𝐬𝐩𝐞𝐜𝐢𝐚𝐥𝐥𝐲 𝐦𝐞𝐝𝐢𝐚.

👤 *Q5:* 𝐂𝐚𝐧 𝐛𝐨𝐭 𝐰𝐨𝐫𝐤 𝐢𝐧 𝐃𝐌?
🤖 *A:* ❌ 𝐍𝐨, 𝐢𝐭 𝐰𝐨𝐫𝐤𝐬 𝐨𝐧𝐥𝐲 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩𝐬.

👤 *Q6:* 𝐂𝐚𝐧 𝐈 𝐜𝐚𝐥𝐥 𝐭𝐡𝐞 𝐛𝐨𝐭?
🤖 *A:* ⚠️ 𝐘𝐞𝐬, 𝐛𝐮𝐭 𝐲𝐨𝐮 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐛𝐥𝐨𝐜𝐤𝐞𝐝 + 𝐛𝐚𝐧𝐧𝐞𝐝.

👤 *Q7:* 𝐖𝐡𝐞𝐫𝐞 𝐜𝐚𝐧 𝐈 𝐟𝐢𝐧𝐝 𝐊𝐮𝐫𝐮𝐦𝐢 𝐛𝐨𝐭?
🤖 *A:* 𝐈𝐭'𝐬 𝐩𝐫𝐢𝐯𝐚𝐭𝐞𝐥𝐲 𝐨𝐰𝐧𝐞𝐝 𝐛𝐲 *${client.owner}*.

👤 *Q8:* 𝐂𝐚𝐧 𝐈 𝐡𝐢𝐫𝐞 𝐚 𝐛𝐨𝐭 𝐟𝐫𝐨𝐦 *${client.owner}* ?
🤖 *A:* 𝐘𝐞𝐬, 𝐢𝐟 𝐭𝐡𝐞𝐲 𝐚𝐠𝐫𝐞𝐞 𝐭𝐨 𝐢𝐭.

👤 *Q9:* 𝐖𝐡𝐲 𝐢𝐬 𝐛𝐨𝐭 𝐧𝐨𝐭 𝐰𝐨𝐫𝐤𝐢𝐧𝐠?
🤖 *A:* 𝐋𝐚𝐠 𝐨𝐫 𝐢𝐧𝐚𝐜𝐭𝐢𝐯𝐢𝐭𝐲 𝐚𝐫𝐞 𝐜𝐨𝐦𝐦𝐨𝐧 𝐫𝐞𝐚𝐬𝐨𝐧𝐬.

👤 *Q10:* 𝐇𝐨𝐰 𝐜𝐚𝐧 𝐈 𝐦𝐚𝐤𝐞 𝐚 𝐛𝐨𝐭 𝐥𝐢𝐤𝐞 𝐊𝐮𝐫𝐮𝐦𝐢?
🤖 *A:* 𝐔𝐬𝐞 *.script* 𝐭𝐨 𝐠𝐞𝐭 𝐨𝐮𝐫 𝐆𝐢𝐭𝐇𝐮𝐛 𝐫𝐞𝐩𝐨.

👤 *Q11:* 𝐈𝐬 𝐭𝐡𝐢𝐬 𝐩𝐫𝐨𝐣𝐞𝐜𝐭 𝐬𝐩𝐨𝐧𝐬𝐨𝐫𝐞𝐝?
🤖 *A:* 𝐍𝐨, 𝐛𝐮𝐭 𝐝𝐨𝐧𝐚𝐭𝐢𝐧𝐠 𝐢𝐬 𝐚𝐥𝐰𝐚𝐲𝐬 𝐰𝐞𝐥𝐜𝐨𝐦𝐞!

╰━━━━━━━━━━━━━━━╯`;

        await client.sendMessage(
            M.from,
            {
                image: { url: thumbnailUrl },
                caption: caption,
                gifPlayback: true
            },
            { quoted: M }
        );
    }
};
