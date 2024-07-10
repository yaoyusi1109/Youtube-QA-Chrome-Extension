const { getSubtitles } = require('youtube-captions-scraper');

async function fetchYouTubeTranscript(videoId) {
    try {
        // Fetch the transcript for the given video ID
        const transcript = await getSubtitles({
            videoID: videoId,
            lang: 'en' // You can change the language if needed
        });

        // Convert transcript to JSON format
        const jsonFormatted = JSON.stringify(transcript, null, 2);

        return jsonFormatted;

    } catch (error) {
        console.error(`An error occurred: ${error}`);
        return null;
    }
}

// Example usage
(async () => {
    const videoId = "t6lBeG5QaC4";  // Replace with the actual YouTube video ID
    const transcript = await fetchYouTubeTranscript(videoId);
    if (transcript) {
        console.log(`Transcript:\n${transcript}`);
    } else {
        console.log("Transcript not found or could not be fetched.");
    }
})();
