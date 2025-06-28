const chalk = require('chalk');
const { WACallEvent } = require('@WhiskeySockets/baileys');

module.exports = callHandler = async (client) => {
    // Reject the incoming call
    const rejectCall = async (call) => {
        if (call.status !== 'offer') return;
        await client.rejectCall(call.id, call.from, call.isVideo); // actively reject the call
    };

    // Handle the call
    const handleCall = async (call) => {
        if (call.status !== 'offer') return;

        const caller = call.from;
        const contact = await client.getContact(caller);
        const username = contact.name || contact.notify || caller;

        client.log(`${chalk.cyanBright('Blocked Call')} from ${chalk.blueBright(username)}`);

        await rejectCall(call); // reject the call
        await client.sendMessage(caller, {
            text: '*You have been banned for calling this bot.*\n\n_This bot does not accept calls. You are now blocked and banned._',
        });

        await client.DB.push('banned', caller); // add to your banned list (you must manage this in your DB logic)
        await client.updateBlockStatus(caller, 'block'); // block the user
    };

    // Attach event listener
    client.ev.on('call', async (calls) => {
        for (let call of calls) {
            await handleCall(call);
        }
    });
};
