const os = require('os');

module.exports = {
    name: 'info',
    aliases: ['info'],
    category: 'general',
    cool: 20,
    react: '✅',
    description: 'Get bot information',

    async execute(client, arg, M) {
        const thumbnails = [
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

        const getRandomThumbnail = () => thumbnails[Math.floor(Math.random() * thumbnails.length)];

        const pad = (n) => (n < 10 ? '0' : '') + n;

        const formatTime = (secs) => {
            const hrs = Math.floor(secs / 3600);
            const mins = Math.floor((secs % 3600) / 60);
            const secsLeft = Math.floor(secs % 60);
            return `${pad(hrs)}:${pad(mins)}:${pad(secsLeft)}`;
        };

        const getCpuUsage = () => {
            const start = cpuAverage();
            return new Promise((resolve) => {
                setTimeout(() => {
                    const end = cpuAverage();
                    const idleDiff = end.idle - start.idle;
                    const totalDiff = end.total - start.total;
                    const usage = 100 - ~~((100 * idleDiff) / totalDiff);
                    resolve(usage);
                }, 1000);
            });
        };

        const cpuAverage = () => {
            const cpus = os.cpus();
            let totalIdle = 0, totalTick = 0;

            for (const cpu of cpus) {
                for (const type in cpu.times) {
                    totalTick += cpu.times[type];
                }
                totalIdle += cpu.times.idle;
            }

            return {
                idle: totalIdle / cpus.length,
                total: totalTick / cpus.length
            };
        };

        const groups = Object.values(await client.groupFetchAllParticipating());
        const groupCount = groups.length;

        const uptime = formatTime(process.uptime());
        const cpuUsage = await getCpuUsage();
        const usedMemory = client.utils.formatSize(os.totalmem() - os.freemem());
        const totalUsers = Object.values(await client.contactDB.all()).length;

        const thumbnail = await client.utils.getBuffer(getRandomThumbnail());

        const botInfo = `\n\n🚀 *Commands:* ${client.cmd.size}` +
                        `\n\n⏳ *Uptime:* ${uptime}` +
                        `\n\n👥 *Users:* ${totalUsers}` +
                        `\n\n🔧 *Mods:* ${client.mods?.length || 0}` +
                        `\n\n🌐 *Groups:* ${groupCount}` +
                        `\n\n💽 *Memory Used:* ${usedMemory}` +
                        `\n\n📊 *CPU Usage:* ${cpuUsage.toFixed(2)}%` +
                        `\n\n🤖 *Bot Version:* 2.0` +
                        `\n\n👤 *Bot Owner:* Deryl💚`;

        await client.sendMessage(M.from, {
            text: botInfo,
            contextInfo: {
                externalAdReply: {
                    title: '',
                    body: '',
                    thumbnail,
                    mediaType: 1
                }
            }
        });
    }
};
