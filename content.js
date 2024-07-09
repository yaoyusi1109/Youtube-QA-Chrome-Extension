const YOUTUBE_API_KEY = 'AIzaSyAbvwyATa0Q9hdVBdIOiEogkrFuppFdkLc';
const OPENAI_API_KEY = `Bearer sk-proj-ax6mHgpw5aXW0mXUdVxJT3BlbkFJCmMqJ2GOvDO8urva05j2`; 

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
chatHeader.innerText = 'Video Q&A - Yusi\'s version';
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

// Make chat container draggable
let isDragging = false;
let dragOffsetX, dragOffsetY;

chatHeader.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragOffsetX = e.clientX - chatContainer.offsetLeft;
  dragOffsetY = e.clientY - chatContainer.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    chatContainer.style.left = (e.clientX - dragOffsetX) + 'px';
    chatContainer.style.top = (e.clientY - dragOffsetY) + 'px';
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Event listener for the chat input field
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim() !== '') {
    handleSendMessage();
  }
});

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
    // Fetch the video transcript and send the question to ChatGPT
    const videoTranscript = await fetchVideoTranscript();
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
  const context = `Transcript: ${videoTranscript}\nQuestion: ${question}`;

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
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from ChatGPT');
  }
  return data.choices[0].message.content.trim();
}

// Function to fetch the video transcript from YouTube
async function fetchVideoTranscript() {
  const videoId = new URL(window.location.href).searchParams.get('v');
  if (!videoId) {
    console.error('No video ID found in URL');
    return 'No transcript available for this video.';
  }

  const response = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`);
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    console.error('No captions found for this video.');
    return 'No transcript available for this video.';
  }

  // Assuming the first caption track is the one we want
  const captionId = data.items[0].id;
  const captionResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${YOUTUBE_API_KEY}`);
  const captionData = await captionResponse.json();

  if (!captionData.items || captionData.items.length === 0) {
    console.error('No transcript found in captions.');
    return 'No transcript available for this video.';
  }

  // Here we assume that the captionData contains the required text directly in the items
  return captionData.items.map(item => item.snippet.text).join(' ');
}
