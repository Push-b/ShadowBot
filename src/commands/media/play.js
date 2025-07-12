const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { tmpdir } = require('os');
const { writeFile, unlink } = require('fs/promises');

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  name: 'play',
  aliases: ['song'],
  category: 'media',
  usage: 'Use :play <song name>',
  description: 'Plays audio from YouTube using WhatsApp audio player',
  react: "🎵",

  async execute(client, arg, M) {
    try {
      if (!arg) return M.reply('❌ Please provide a song name.');
      const query = arg.trim();

      const api = `https://ytplay-1.onrender.com/api?query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(api);

      const audioUrl = data?.result?.download?.audio;
      const title = data?.result?.title || 'Unknown Title';
      const thumbnail = data?.result?.thumbnail;
      const videoUrl = data?.result?.url;

      if (!data?.status || !data?.success || !audioUrl) {
        return M.reply('❌ No audio found. Try another keyword.');
      }

      const inputPath = path.join(tmpdir(), `${Date.now()}_in.mp3`);
      const outputPath = path.join(tmpdir(), `${Date.now()}_out.mp3`);
      const mp3Buffer = (await axios.get(audioUrl, { responseType: 'arraybuffer' })).data;
      await writeFile(inputPath, Buffer.from(mp3Buffer));

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .audioCodec('libmp3lame')
          .format('mp3')
          .audioBitrate(128)
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      const finalBuffer = await fs.promises.readFile(outputPath);

      await unlink(inputPath);
      await unlink(outputPath);
      
      await M.reply(`🎵 Downloading: ${title}`);
      
      await client.sendMessage(
        M.from,
        {
          audio: finalBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: title,
              body: 'By Deryl 💚',
              mediaUrl: videoUrl,
              thumbnail: thumbnail
                ? await client.util.fetchBuffer(thumbnail)
                : null,
              mediaType: 2
            }
          }
        },
        { quoted: M }
      );
    } catch (err) {
      console.error('❌ Error in play command:', err);
      M.reply('❌ Failed to fetch or convert audio.');
    }
  }
};
