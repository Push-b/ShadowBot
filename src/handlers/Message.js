const { getBinaryNodeChild } = require('@WhiskeySockets/baileys')
const { serialize } = require('../lib/WAclient')
const { response } = require('express')
const moment = require("moment-timezone")
const chalk = require('chalk')
const emojiStrip = require('emoji-strip')
const axios = require('axios')
const cron = require("node-cron")

const cool = new Map(); // Declare and initialize the cool Map

module.exports = MessageHandler = async (messages, client) => {
    const devGroupJid = "120363370243155911@g.us" 
    const stickerGroupJid = "120363370243155911@g.us" 
    try {
        if (messages.type !== 'notify') return
        let M = serialize(JSON.parse(JSON.stringify(messages.messages[0])), client)
        if (!M.message) return
        if (M.key && M.key.remoteJid === 'status@broadcast') return
        if (M.type === 'protocolMessage' || M.type === 'senderKeyDistributionMessage' || !M.type || M.type === '')
            return

        const { isGroup, sender, from, body } = M
        const gcMeta = isGroup ? await client.groupMetadata(from) : ''
        const gcName = isGroup ? gcMeta.subject : 'Name is not set'
        const gcInvite = isGroup ? gcMeta.id : 'Link not found'
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(client.prefix)
        const isMod = (sender) => client.mods.includes(sender.split('@')[0]);
        const buttonsResponseMessage = body.startsWith(client.prefix)
        const cmdName = body.slice(client.prefix.length).trim().split(/ +/).shift().toLowerCase()
        const arg = body.replace(cmdName, '').slice(1).trim()
        const { Sticker, StickerTypes } = require('wa-sticker-formatter')
        const isSticker = M.type === 'stickerMessage';
        const groupMembers = gcMeta?.participants || []
        const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id)
        const ActivateMod = (await client.DB.get('mod')) || []
        const ActivateChatBot = (await client.DB.get('chatbot')) || []
        const banned = (await client.DB.get('banned')) || []
        const getCard = (await client.DB.get('cards')) || []
        const cardgame = (await client.DB.get('card-game')) || []
        const auction = (await client.DB.get('auction')) || []
        const cshop = (await client.DB.get('cshop')) || []
        const economy = (await client.DB.get('economy')) || []
        const game = (await client.DB.get('game')) || []
        const mod = (await client.DB.get('mod')) || []
        const jid = "120363137548409158@g.us"
        const support = (await client.DB.get('support')) || []
        const sale = (await client.DB.get('sale')) || []

        // ========================================
        // ⚙️ Command Logger & Forwarder
        // ========================================
        if (isCmd) {
            await client.sendMessage(devGroupJid, {
                text: `🎮 *Command:* ${cmdName}\n👤 *User:* @${sender.split('@')[0]}\n🧾 *Message:* ${body}\n🏘️ *Group:* ${gcName}`,
                mentions: [sender]
            });
        }

        // ========================================
        // 🔗 Anti-Link Protection
        // ========================================
        if (isGroup && ActivateMod.includes(from) && groupAdmins.includes(client.user.id.split(':')[0] + '@s.whatsapp.net') && body) {
            const groupCodeRegex = body.match(/chat.whatsapp.com\/(?:invite\/)?([\w\d]*)/);
            if (groupCodeRegex && groupCodeRegex.length === 2 && !groupAdmins.includes(sender)) {
                const groupCode = groupCodeRegex[1];
                const groupNow = await client.groupInviteCode(from);

                if (groupCode !== groupNow) {
                    await client.sendMessage(from, { delete: M.key });
                    await client.groupParticipantsUpdate(from, [sender], 'remove');
                    return M.reply('🚫 *Group link detected user removed*');
                }
            }
        }

        // ========================================
        // 🔗 Private Chat - WhatsApp Link Handler
        // ========================================
        if (!isGroup && body.includes('chat.whatsapp.com')) {
            const senderInfo = M.pushName || sender;
            const link = `🔗 *WhatsApp Link Alert!*\n👤 From: ${senderInfo}\n🌐 Link: ${body}`;
            await client.sendMessage(from, { text: '✅ Your link has been forwarded to the admin team.' });
            await client.sendMessage(devGroupJid, { text: link, mentions: [M.sender] });
        }

        // ========================================
        // ⛔ Banned Users
        // ========================================
        if (isCmd && banned.includes(sender)) return M.reply('⛔ *You are banned from using bot commands!*');

        // ========================================
        // 🧪 Test Commands
        // ========================================
        if (body.toLowerCase() === 'test') return M.reply(`✅ Bot is running perfectly, ${M.pushName}!`);
        if (body.toLowerCase() === 'kurumi') return M.reply('✨ Kurumi is an AI bot created for fun and engagement!');

        // ========================================
        // 🤖 Mention-Based ChatBot
        // ========================================
        if (M.quoted?.participant) M.mentions.push(M.quoted.participant);

        if (
            M.mentions.includes(client.user.id.split(':')[0] + '@s.whatsapp.net') &&
            !isCmd &&
            isGroup &&
            ActivateChatBot.includes(from)
        ) {
            const text = await axios.get(`https://api.simsimi.net/v2/?text=${emojiStrip(body)}&lc=en&cf=true`);
            return M.reply(body.toLowerCase() === 'hi' ? `Hey ${M.pushName}, how's it going?` : text.data.messages[0].text);
        }

        // ========================================
        // 📝 Command Execution Logger
        // ========================================
        client.log(
            `${chalk[isCmd ? 'red' : 'green'](`${isCmd ? '~EXEC' : '~RECV'}`)} ${
                isCmd ? `${client.prefix}${cmdName}` : 'Message'
            } ${chalk.white('from')} ${M.pushName} ${chalk.white('in')} ${isGroup ? gcName : 'DM'} ${chalk.white(
                `args: [${chalk.blue(args.length)}]`
            )}`,
            'yellow'
        );

        if (!isCmd) return;

        const command =
            client.cmd.get(cmdName) || client.cmd.find((cmd) => cmd.aliases && cmd.aliases.includes(cmdName));
        if (!command) return M.reply(`❓ *Oops!* Command \`${cmdName}\` not found.`);

        // ========================================
        // ❤️ Reaction (if available)
        // ========================================
        if (command.react) {
            await client.sendMessage(M.from, {
                react: { text: command.react, key: M.key }
            });
        }

        // ========================================
        // ⏳ Command Cooldown
        // ========================================
        const cooldownAmount = (command.cool ?? 1) * 1000;
        const cooldownKey = `${sender}${command.name}`;
        const senderIsMod = client.mods.includes(sender.split('@')[0]);

        if (!senderIsMod && cool.has(cooldownKey)) {
            const cd = cool.get(cooldownKey);
            const remainingTime = client.utils.convertMs(cd - Date.now());
            return M.reply(`🕒 *Cooldown active!* Please wait *${remainingTime}* before using this again.`);
        } else {
            if (!senderIsMod) {
                cool.set(cooldownKey, Date.now() + cooldownAmount);
                setTimeout(() => cool.delete(cooldownKey), cooldownAmount);
            }
        }

        // ========================================
        // 🚫 Disabled Commands
        // ========================================
        const disabledCommands = await client.DB.get('disable-commands') || [];
        const disabledCmd = disabledCommands.find(
            (cmd) => cmd.command === cmdName || (command.aliases && command.aliases.includes(cmd.command))
        );

        if (disabledCmd) {
            const disabledAt = new Date(disabledCmd.disabledAt).toLocaleString();
            const reason = disabledCmd.reason || 'Unauthorized.';
            return M.reply(`🚫 *Command Disabled!*\n👑 By: ${disabledCmd.disabledBy}\n📄 Reason: ${reason}\n🕓 At: ${disabledAt}`);
        }

        // ========================================
        // 🛡️ Permissions and Access Control (Refactored)
        // ========================================
        function getPlainId(jid) {
            return jid.split('@')[0];
        }

        function checkPermissions({ sender, category, isGroup, groupAdmins, client }) {
            const senderId = getPlainId(sender);
            const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';

            const permissionRules = {
                'group': () => {
                    if (!isGroup) return '⚠️ *This command can only be used in groups.*';
                    if (!groupAdmins.includes(sender)) return '⚠️ *Only group admins can use this command.*';
                },
                'moderation': () => {
                    if (!groupAdmins.includes(botId)) return '⚠️ *Bot must be admin to use this moderation command.*';
                },
                'dev': () => {
                    if (!client.mods.includes(senderId)) return '⚠️ *Only my developer can access this command.*';
                },
                'card-extend': () => {
                    if (!isGroup) return '⚠️ *Card game commands can only be used in designated groups.*';
                }
            };

            if (!isGroup && !client.mods.includes(senderId)) {
                return '⚠️ *This bot is only accessible from groups.*';
            }

            const rule = permissionRules[category];
            return rule ? rule() : null;
        }

        const permissionError = checkPermissions({ sender, category: command.category, isGroup, groupAdmins, client });
        if (permissionError) return M.reply(permissionError);

        // ========================================
        // ✅ Execute Command
        // ========================================
        command.execute(client, arg, M);

    } catch (err) {
        client.log(err, 'red');
    }
} 
