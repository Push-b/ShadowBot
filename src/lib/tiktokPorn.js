const spankbang = require('spankbang');

const fetchRandomVideo = async () => {
  try {
    const page = 12;

    // Fetch data from different sections
    const trendingData = await spankbang.videos.sections.trending({ page });
    const upcomingData = await spankbang.videos.sections.upcoming({ page });
    const newVideosData = await spankbang.videos.sections.newVideos({ page });
    const popularData = await spankbang.videos.sections.popular({ page });

    // Combine all the video URLs into a single array
    const allVideos = [
      ...trendingData.videos,
      ...upcomingData.videos,
      ...newVideosData.videos,
      ...popularData.videos
    ];

    // Select a random video from the combined array
    const randomIndex = Math.floor(Math.random() * allVideos.length);
    const randomVideo = allVideos[randomIndex];

    console.log('Random video:', randomVideo);

    // Fetch details for the random video
    const details = await spankbang.videos.details({ url: randomVideo.path });

    // Extract the URL for the 720p quality
    const video720p = details.files.find(file => file.quality === '720p');
    const video720pURL = video720p ? video720p.url : null;

    console.log('720p Video URL:', video720pURL);

    return video720pURL;
  } catch (error) {
    console.error('Error fetching random video:', error.message);
    return null;
  }
};

module.exports = fetchRandomVideo();
