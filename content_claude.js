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
chatContainer.style.display = 'none'; // Initially hidden
document.body.appendChild(chatContainer);

const chatHeader = document.createElement('div');
chatHeader.innerText = 'Video Q&A';
chatHeader.style.backgroundColor = '#343a40';
chatHeader.style.color = '#ffffff';
chatHeader.style.padding = '10px';
chatHeader.style.borderTopLeftRadius = '10px';
chatHeader.style.borderTopRightRadius = '10px';
chatHeader.style.textAlign = 'center';
chatHeader.style.cursor = 'move'; // Make it look draggable
chatContainer.appendChild(chatHeader);

const chatBody = document.createElement('div');
chatBody.style.height = '400px';
chatBody.style.overflowY = 'auto';
chatBody.style.padding = '10px';
chatBody.style.backgroundColor = '#282c34';
chatBody.style.color = '#ffffff';
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

async function handleSendMessage() {
  const question = chatInput.value.trim();
  chatInput.value = '';

  if (question === '') return;

  // Display user's question
  appendMessage(question, 'user');

  const loadingMessage = showLoading('Fetching answer...');

  try {
    const videoTranscript = await fetchVideoTranscript();
    const response = await fetchChatGPTResponse(question, videoTranscript);
    chatBody.removeChild(loadingMessage);
    appendMessage(response, 'assistant');
  } catch (error) {
    console.error('Error fetching ChatGPT response:', error);
    chatBody.removeChild(loadingMessage);
    appendMessage('Error fetching response. Please try again.', 'error');
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

function appendMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.style.padding = '10px';
  messageElement.style.margin = '10px 0';
  messageElement.style.borderRadius = '5px';

  if (sender === 'user') {
    messageElement.style.backgroundColor = '#007bff';
    messageElement.style.color = '#ffffff';
    messageElement.style.alignSelf = 'flex-end';
  } else if (sender === 'assistant') {
    messageElement.style.backgroundColor = '#28a745';
    messageElement.style.color = '#ffffff';
  } else {
    messageElement.style.backgroundColor = '#dc3545';
    messageElement.style.color = '#ffffff';
  }

  chatBody.appendChild(messageElement);
}

function showLoading(message) {
  const loadingMessage = document.createElement('div');
  loadingMessage.innerText = message;
  loadingMessage.style.padding = '10px';
  loadingMessage.style.margin = '10px 0';
  loadingMessage.style.backgroundColor = '#444';
  loadingMessage.style.color = '#ffffff';
  loadingMessage.style.borderRadius = '5px';
  chatBody.appendChild(loadingMessage);
  return loadingMessage;
}

async function fetchVideoTranscript() {
  const videoId = new URL(window.location.href).searchParams.get('v');
  if (!videoId) {
    console.error('No video ID found in URL');
    return 'No transcript available for this video.';
  }

  try {
    // Wait for the transcript button to appear
    await waitForElement('.ytp-subtitles-button');

    // Click the transcript button to open the transcript panel
    const transcriptButton = document.querySelector('.ytp-subtitles-button');
    transcriptButton.click();

    // Wait for the transcript panel to appear and extract the text
    await waitForElement('.ytd-transcript-body-renderer');
    const transcriptElements = document.querySelectorAll('.ytd-transcript-body-renderer');
    
    let transcript = '';
    transcriptElements.forEach(element => {
      transcript += element.textContent.trim() + ' ';
    });

    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return 'Error fetching transcript. Please try again.';
  }
}

function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

async function fetchChatGPTResponse(question, videoTranscript) {
  const context = `Transcript: ${videoTranscript}\nQuestion: ${question}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
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