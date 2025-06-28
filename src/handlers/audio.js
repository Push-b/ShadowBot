sendAudioMessage = async (from, url, M, ppt, contextInfo = {}) => {
    try {
      return await this.sendMessage(
        from,
        {
          audio: typeof url === "string" ? { url } : url,
          mimetype: "audio/mpeg",
          ptt: ppt ?? false,
          contextInfo: {
            ...contextInfo,
          },
        },
        { quoted: M },
      );
    } catch (error) {
      throw new Error(error);
    }
  };
