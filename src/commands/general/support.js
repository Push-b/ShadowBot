module.exports = {
    name: 'support',
    aliases: ['support'],
    category: 'general',
    cool: 30,
    react: "✅",
    description: 'Bot rules and support info',

    async execute(client, arg, M) {
        let rules = `
*▬▬๑۩ SUPPORT ۩๑▬▬*

🆕 *Join the official update group:*
https://chat.whatsapp.com/IfipLLLsEUE8aXs2L4YvYj

▬▬▬▬▬▬▬▬▬

📞 *Contact the Owner Directly:*

🤴 *Username:* Deryl  
📱 *WhatsApp:* https://wa.me/263788671478
        `.trim();

        await M.reply(rules);
    }
}
