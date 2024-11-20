const socket = io();
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const imageButton = document.getElementById('imageButton');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('usernameInput');
const joinButton = document.getElementById('joinButton');
const usernameDisplay = document.getElementById('username');

let currentUserId = null;
let currentUsername = null;

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(data, isImage = false) {
    const { message, userId, username, timestamp } = data;
    const isSent = userId === currentUserId;
    
    if (username === undefined) {
        // System message
        const systemDiv = document.createElement('div');
        systemDiv.className = 'system-message';
        systemDiv.textContent = message;
        messages.appendChild(systemDiv);
    } else {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        // Add username if it's not the current user
        if (!isSent) {
            const messageInfo = document.createElement('div');
            messageInfo.className = 'message-info';
            messageInfo.textContent = username;
            messageDiv.appendChild(messageInfo);
        }
        
        if (isImage) {
            const img = document.createElement('img');
            img.src = message;
            img.onerror = () => {
                messageContent.textContent = "Error loading image";
            };
            messageContent.appendChild(img);
        } else {
            messageContent.textContent = message;
        }
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = formatTimestamp(timestamp);
        messageContent.appendChild(messageTime);
        
        messageDiv.appendChild(messageContent);
        messages.appendChild(messageDiv);
    }
    
    messages.scrollTop = messages.scrollHeight;
}

socket.on('connect', () => {
    currentUserId = socket.id;
});

joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUsername = username;
        socket.emit('user joined', username);
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        usernameDisplay.textContent = username;
        messageInput.focus();
    }
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinButton.click();
    }
});

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

imageButton.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        try {
            imagePreview.innerHTML = '';
            const previewImg = document.createElement('img');
            previewImg.src = URL.createObjectURL(file);
            const sendBtn = document.createElement('button');
            sendBtn.textContent = 'Send';
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.backgroundColor = '#dc3545';
            
            imagePreview.appendChild(previewImg);
            imagePreview.appendChild(sendBtn);
            imagePreview.appendChild(cancelBtn);
            imagePreview.style.display = 'block';

            sendBtn.onclick = async () => {
                const compressedImage = await compressImage(file);
                socket.emit('image message', compressedImage);
                imagePreview.style.display = 'none';
                imageInput.value = '';
            };

            cancelBtn.onclick = () => {
                imagePreview.style.display = 'none';
                imageInput.value = '';
            };
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try again.');
        }
    }
});

socket.on('chat message', (data) => {
    appendMessage(data);
});

socket.on('image message', (data) => {
    appendMessage({ ...data, message: data.image }, true);
});

socket.on('user joined', (data) => {
    appendMessage(data);
});

socket.on('user left', (data) => {
    appendMessage(data);});