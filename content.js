// const { getSubtitles } = require('youtube-captions-scraper');
// Add the fetchYouTubeTranscript function from fetchCaptions.js
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

const OPENAI_API_KEY = null; //openAI key


// Create chat interface elements
const chatContainer = document.createElement('div');
chatContainer.style.position = 'fixed';
chatContainer.style.bottom = '10px';
chatContainer.style.right = '10px';
chatContainer.style.width = '350px';
chatContainer.style.height = '500px';
chatContainer.style.backgroundColor = '#1e1e1e';
chatContainer.style.border = '1px solid #444';
chatContainer.style.borderRadius = '10px';
chatContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
chatContainer.style.zIndex = '10000';
document.body.appendChild(chatContainer);

const chatHeader = document.createElement('div');
chatHeader.innerText = 'Chat with ChatGPT';
chatHeader.style.backgroundColor = '#343a40';
chatHeader.style.color = '#ffffff';
chatHeader.style.padding = '10px';
chatHeader.style.borderTopLeftRadius = '10px';
chatHeader.style.borderTopRightRadius = '10px';
chatHeader.style.textAlign = 'center';
chatContainer.appendChild(chatHeader);

const chatBody = document.createElement('div');
chatBody.style.flex = '1';
chatBody.style.overflowY = 'auto';
chatBody.style.padding = '10px';
chatBody.style.backgroundColor = '#282c34';
chatBody.style.color = '#ffffff';
chatBody.style.borderBottomLeftRadius = '10px';
chatBody.style.borderBottomRightRadius = '10px';
chatContainer.appendChild(chatBody);

const chatInputContainer = document.createElement('div');
chatInputContainer.style.display = 'flex';
chatInputContainer.style.padding = '10px';
chatInputContainer.style.backgroundColor = '#343a40';
chatInputContainer.style.borderBottomLeftRadius = '10px';
chatInputContainer.style.borderBottomRightRadius = '10px';
chatContainer.appendChild(chatInputContainer);

const chatInput = document.createElement('input');
chatInput.type = 'text';
chatInput.placeholder = 'Ask a question...';
chatInput.style.flex = '1';
chatInput.style.padding = '10px';
chatInput.style.marginRight = '10px';
chatInput.style.border = '1px solid #444';
chatInput.style.borderRadius = '5px';
chatInput.style.backgroundColor = '#1e1e1e';
chatInput.style.color = '#ffffff';
chatInput.style.outline = 'none';
chatInputContainer.appendChild(chatInput);

const sendButton = document.createElement('button');
sendButton.innerText = 'Send';
sendButton.style.padding = '10px 20px';
sendButton.style.border = 'none';
sendButton.style.borderRadius = '5px';
sendButton.style.backgroundColor = '#007bff';
sendButton.style.color = '#ffffff';
sendButton.style.cursor = 'pointer';
sendButton.addEventListener('click', () => handleSendMessage());
chatInputContainer.appendChild(sendButton);

// Toggle button
const toggleButton = document.createElement('button');
toggleButton.innerText = 'Toggle Q&A';
toggleButton.style.position = 'fixed';
toggleButton.style.top = '10px';
toggleButton.style.right = '10px';
toggleButton.style.zIndex = '10001';
toggleButton.style.padding = '10px';
toggleButton.style.backgroundColor = '#007bff';
toggleButton.style.color = '#ffffff';
toggleButton.style.border = 'none';
toggleButton.style.borderRadius = '5px';
toggleButton.style.cursor = 'pointer';
toggleButton.addEventListener('click', () => {
  chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
});
document.body.appendChild(toggleButton);

// Event listener for the chat input field
chatInput.addEventListener('keydown', async (e) => {
if (e.key === 'Enter' && chatInput.value.trim() !== '') {
  handleSendMessage();
}
});

async function handleSendMessage() {
const question = chatInput.value.trim(); // Get the user's question
chatInput.value = ''; // Clear the input field

if (question === '') return;

// Display the user's question in the chat
const userMessage = document.createElement('div');
userMessage.innerText = question;
userMessage.style.padding = '10px';
userMessage.style.margin = '10px 0';
userMessage.style.backgroundColor = '#007bff';
userMessage.style.color = '#ffffff';
userMessage.style.borderRadius = '5px';
userMessage.style.alignSelf = 'flex-end';
chatBody.appendChild(userMessage);

// Display a "Thinking..." message while waiting for the response
const responseMessage = document.createElement('div');
responseMessage.innerText = 'Thinking...';
responseMessage.style.padding = '10px';
responseMessage.style.margin = '10px 0';
responseMessage.style.backgroundColor = '#444';
responseMessage.style.color = '#ffffff';
responseMessage.style.borderRadius = '5px';
chatBody.appendChild(responseMessage);

try {
  const videoId = new URL(window.location.href).searchParams.get('v');
  if (!videoId) {
    throw new Error('No video ID found in URL');
  }

  // Fetch the video transcript and send the question to ChatGPT
  const videoTranscript = await fetchYouTubeTranscript(videoId);
  console.log('Fetched Transcript:', videoTranscript); // Log the transcript to the console
  const response = await fetchChatGPTResponse(question, videoTranscript);
  responseMessage.innerText = response; // Display the response
} catch (error) {
  console.error('Error fetching ChatGPT response:', error);
  responseMessage.innerText = 'Error fetching response. Please try again.';
}

// Scroll to the bottom of the chat
chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to fetch the response from ChatGPT
async function fetchChatGPTResponse(question, videoTranscript) {
// Combine the video transcript and the user's question into a single prompt
const context = `Transcript: ${videoTranscript}\nQuestion: ${question}`;

// Send the prompt to the ChatGPT API and fetch the response
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': OPENAI_API_KEY
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: context
      }
    ]
  })
});

const data = await response.json();
// Handle cases where there are no responses
if (!data.choices || data.choices.length === 0) {
  throw new Error('No response from ChatGPT');
}

// Return the response text
return data.choices[0].message.content.trim();
}
