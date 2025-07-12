module.exports = {
  name: 'delete',
  aliases: ['del'],
  category: 'general',
  react: "✅",
  description: 'Deletes the quoted message',
  async execute(client, arg, M) {
    if (!M.quoted) {
      return M.reply('❗ *Please quote the message you want me to delete.*');
    }

    // Delete the quoted message
    try {
      await client.sendMessage(M.from, {
        delete: M.quoted.key
      });

      M.reply('✅ *Successfully deleted the quoted message.*');
    } catch (error) {
      M.reply('⚠️ *Error: Could not delete the message. Please try again later.*');
    }
  }
};
