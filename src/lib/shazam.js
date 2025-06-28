const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const axios = require("axios");

// Function to extract audio from video
function extractAudio(videoPath, audioOutputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioOutputPath)
      .noVideo()
      .on("end", () => {
        console.log(`Audio extracted to: ${audioOutputPath}`);
        resolve(audioOutputPath);
      })
      .on("error", (err) => {
        console.error("Error extracting audio:", err);
        reject(err);
      })
      .run();
  });
}

// Function to recognize music using Audd.io API
async function recognizeMusic(audioFilePath) {
  const apiToken = "13d53b3e4aef98cd6ead72bf3b8fef9a"; // Your API token

  try {
    const audioFile = fs.createReadStream(audioFilePath);
    const formData = new FormData();
    formData.append("api_token", apiToken);
    formData.append("file", audioFile);

    const response = await axios.post("https://api.audd.io/", formData, {
      headers: formData.getHeaders(),
    });

    if (response.status === 200 && response.data.result) {
      return response.data.result;
    } else {
      console.log("No match found for the audio.");
      return null;
    }
  } catch (error) {
    console.error("Error recognizing music:", error);
    return null;
  }
}
