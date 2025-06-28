// log.js
module.exports = {
    async logMessage(client, groupId, message) {
        try {
            // Check if client is connected before sending a message
            if (client.state === 'open') {
                await client.sendMessage(groupId, { text: message });
            } else {
                console.log(`Skipping message "${message}" as client is not connected.`);
            }
        } catch (error) {
            console.error(`Failed to send message "${message}" to group ${groupId}:`, error);
        }
    }
};
