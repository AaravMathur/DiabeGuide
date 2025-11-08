window.onload = () => {
    const chatWindow = document.getElementById('chat-window');
    console.log('chatWindow:', chatWindow);

    if (!chatWindow) {
        console.error('Chat window element not found. Chatbot functionality disabled.');
        return;
    }

    // Typing control variables
    let typingPaused = false;
    let typingTimeoutId = null;
    let currentTypingState = null;
    let autoScrollEnabled = true;
    let currentAbortController = null; // For canceling API requests
    let isWaitingForResponse = false; // Track if we're waiting for API response

    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => sendMessage(userInput.value));
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(userInput.value);
            }
        });
    }

    async function sendMessage(message) {
        if (!message.trim()) return;
        
        // Cancel any ongoing request
        if (currentAbortController) {
            currentAbortController.abort();
        }
        
        appendMessage(message, 'user');
        userInput.value = '';

        const loadingIndicator = appendLoadingIndicator();
        
        // Show pause/cancel button in controls
        isWaitingForResponse = true;
        const pauseBtn = document.getElementById('pause-resume-btn');
        const pauseIcon = document.getElementById('pause-icon');
        if (pauseBtn && pauseIcon) {
            pauseBtn.style.display = 'inline-block';
            pauseIcon.textContent = '✕';
            pauseBtn.title = 'Cancel request';
        }
        
        // Show stop generating button (it will cancel the request)
        showStopGeneratingButton();
        // Update stop button text for cancellation
        const stopBtn = document.getElementById('stop-generating-btn');
        const stopText = stopBtn ? stopBtn.querySelector('.stop-text') : null;
        if (stopText) {
            stopText.textContent = 'Cancel request';
        }

        // Create abort controller for this request
        currentAbortController = new AbortController();

        console.log('Sending message to /api/chat:', message);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
                signal: currentAbortController.signal
            });
            
            // Check if request was aborted
            if (currentAbortController.signal.aborted) {
                removeLoadingIndicator(loadingIndicator);
                isWaitingForResponse = false;
                hidePauseButton();
                return;
            }
            
            console.log('Received response from /api/chat:', response);
            const result = await response.json();
            console.log('Parsed JSON response:', result);
            removeLoadingIndicator(loadingIndicator);
            isWaitingForResponse = false;
            
            if (result.reply) {
                appendMessageWithTyping(result.reply, 'bot');
            } else if (result.error) {
                appendMessageWithTyping(`Error: ${result.error}`, 'bot');
            }
        } catch (error) {
            // Check if error is due to abort
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
                removeLoadingIndicator(loadingIndicator);
                appendMessage('Request cancelled.', 'bot');
                isWaitingForResponse = false;
                hidePauseButton();
                hideStopGeneratingButton();
                return;
            } else {
                console.error('Error sending message:', error);
                removeLoadingIndicator(loadingIndicator);
                appendMessageWithTyping('Error: Could not connect to the chatbot.', 'bot');
            }
            isWaitingForResponse = false;
            hidePauseButton();
            hideStopGeneratingButton();
        } finally {
            currentAbortController = null;
        }
    }
    
    function hidePauseButton() {
        const pauseBtn = document.getElementById('pause-resume-btn');
        if (pauseBtn) {
            pauseBtn.style.display = 'none';
        }
    }

    function appendMessage(message, sender, skipTyping = false) {
        console.log('Appending message:', message, sender);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        const p = document.createElement('p');
        if (sender === 'bot') {
            p.innerHTML = marked.parse(message);
        } else {
            p.textContent = message;
        }
        messageElement.appendChild(p);
        chatWindow.appendChild(messageElement);
        if (autoScrollEnabled) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    function appendMessageWithTyping(message, sender) {
        // Reset typing state
        typingPaused = false;
        currentTypingState = null;
        
        // Show pause button for typing (in controls)
        const pauseBtn = document.getElementById('pause-resume-btn');
        const pauseIcon = document.getElementById('pause-icon');
        if (pauseBtn && pauseIcon) {
            pauseBtn.style.display = 'inline-block';
            pauseIcon.textContent = '⏸';
            pauseBtn.title = 'Pause/Resume generation';
        }
        
        // Show "Stop generating" button below input
        showStopGeneratingButton();
        // Reset stop button text
        const stopBtn = document.getElementById('stop-generating-btn');
        const stopText = stopBtn ? stopBtn.querySelector('.stop-text') : null;
        if (stopText) {
            stopText.textContent = 'Stop generating';
        }

        // Create message container
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        const p = document.createElement('p');
        messageElement.appendChild(p);
        chatWindow.appendChild(messageElement);
        
        // Parse markdown to get the HTML structure
        const fullHtml = marked.parse(message);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fullHtml;
        
        // Extract plain text and split into lines
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Split by sentences for better line-by-line effect
        // Split by common sentence endings followed by space
        let textChunks = plainText.split(/([.!?]+\s+)/).filter(chunk => chunk.trim().length > 0);
        
        // Combine sentence endings with their sentences
        for (let i = textChunks.length - 1; i >= 0; i--) {
            if (/^[.!?]+\s*$/.test(textChunks[i]) && i > 0) {
                textChunks[i - 1] += textChunks[i];
                textChunks.splice(i, 1);
            }
        }
        
        // If still too few chunks, split by commas or longer phrases
        if (textChunks.length <= 2 && plainText.length > 100) {
            textChunks = plainText.match(/.{1,80}(\s|$)/g) || [plainText];
        }
        
        // Ensure we have at least one chunk
        if (textChunks.length === 0) {
            textChunks = [plainText];
        }
        
        // Create text span and cursor
        const textSpan = document.createElement('span');
        textSpan.className = 'typing-text';
        const typingCursor = document.createElement('span');
        typingCursor.classList.add('typing-cursor');
        typingCursor.textContent = '▋';
        
        p.appendChild(textSpan);
        p.appendChild(typingCursor);
        
        // Store typing state
        currentTypingState = {
            messageElement: messageElement,
            p: p,
            textSpan: textSpan,
            typingCursor: typingCursor,
            textChunks: textChunks,
            currentIndex: 0,
            displayedText: '',
            fullHtml: fullHtml,
            originalMessage: message
        };
        
        // Start typing animation
        typeNextLine();
    }

    function typeNextLine() {
        if (!currentTypingState) return;
        
        if (typingPaused) {
            // If paused, check again after a delay
            typingTimeoutId = setTimeout(typeNextLine, 100);
            return;
        }
        
        const state = currentTypingState;
        
        if (state.currentIndex < state.textChunks.length) {
            // Add next line/chunk
            state.displayedText += state.textChunks[state.currentIndex];
            state.textSpan.textContent = state.displayedText;
            state.currentIndex++;
            
            // Optional auto-scroll (only if user hasn't scrolled up)
            if (autoScrollEnabled) {
                const isNearBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < 100;
                if (isNearBottom) {
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            }
            
            // Continue typing with faster speed (line-by-line is much faster)
            const delay = 50; // Fast line-by-line typing
            typingTimeoutId = setTimeout(typeNextLine, delay);
        } else {
            // Typing complete - remove cursor and render final markdown HTML
            state.typingCursor.remove();
            state.p.innerHTML = state.fullHtml;
            
            // Hide pause button and stop generating button
            hidePauseButton();
            hideStopGeneratingButton();
            
            // Clear typing state
            currentTypingState = null;
            typingPaused = false;
            
            // Final scroll if enabled
            if (autoScrollEnabled) {
                setTimeout(() => {
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }, 100);
            }
        }
    }
    
    function stopGenerating() {
        if (!currentTypingState) return;
        
        const state = currentTypingState;
        
        // Clear the typing timeout
        if (typingTimeoutId) {
            clearTimeout(typingTimeoutId);
            typingTimeoutId = null;
        }
        
        // Remove cursor and show full response immediately
        state.typingCursor.remove();
        state.p.innerHTML = state.fullHtml;
        
        // Hide buttons
        hidePauseButton();
        hideStopGeneratingButton();
        
        // Clear typing state
        currentTypingState = null;
        typingPaused = false;
        
        // Scroll to bottom
        setTimeout(() => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 100);
    }
    
    function showStopGeneratingButton() {
        const stopContainer = document.getElementById('stop-generating-container');
        if (stopContainer) {
            stopContainer.style.display = 'flex';
        }
    }
    
    function hideStopGeneratingButton() {
        const stopContainer = document.getElementById('stop-generating-container');
        if (stopContainer) {
            stopContainer.style.display = 'none';
        }
    }

    function pauseResumeTyping() {
        const pauseBtn = document.getElementById('pause-resume-btn');
        const pauseIcon = document.getElementById('pause-icon');
        
        // If waiting for API response, cancel it
        if (isWaitingForResponse && currentAbortController) {
            currentAbortController.abort();
            isWaitingForResponse = false;
            hidePauseButton();
            return;
        }
        
        // Otherwise, pause/resume typing
        if (currentTypingState) {
            typingPaused = !typingPaused;
            if (pauseIcon) {
                pauseIcon.textContent = typingPaused ? '▶' : '⏸';
            }
            if (pauseBtn) {
                pauseBtn.title = typingPaused ? 'Resume generation' : 'Pause generation';
            }
            
            if (!typingPaused) {
                // Resume typing
                typeNextLine();
            }
        }
    }

    function appendLoadingIndicator() {
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'bot-message', 'loading-indicator');
        loadingElement.innerHTML = '<p>...</p>';
        chatWindow.appendChild(loadingElement);
        if (autoScrollEnabled) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
        return loadingElement;
    }

    function removeLoadingIndicator(indicatorElement) {
        if (indicatorElement && indicatorElement.parentNode) {
            indicatorElement.parentNode.removeChild(indicatorElement);
        }
    }

    async function loadCurrentSessionChat() {
        if (!chatWindow) return Promise.resolve();
        try {
            const response = await fetch('/api/chat/current_session');
            if (!response.ok) {
                console.error('Failed to load current session');
                // Still show welcome message even if session load fails
                showWelcomeMessage();
                return Promise.resolve();
            }
            const history = await response.json();
            chatWindow.innerHTML = '';
            if (history && Array.isArray(history) && history.length > 0) {
                // Load existing chat history (this replaces the welcome message)
                history.forEach(entry => {
                    if (entry && entry.message && entry.role) {
                        appendMessage(entry.message, entry.role);
                    }
                });
            }
            // If no history, welcome message is already shown by showWelcomeMessage() call at page load
        } catch (error) {
            console.error('Error loading current session:', error);
            // Show welcome message on error
            showWelcomeMessage();
        }
        return Promise.resolve();
    }
    
    function showWelcomeMessage() {
        // Show welcome message immediately without animation
        // Only if chat window is empty
        if (chatWindow) {
            const hasMessages = chatWindow.children.length > 0;
            if (!hasMessages) {
                appendMessage('Hello! How can I help you with your diabetes management?', 'bot');
            }
        }
    }

    async function loadArchivedChatHistory() {
        if (!chatWindow) return;
        try {
            const response = await fetch('/api/chat/history');
            if (!response.ok) {
                alert('Failed to load chat history. Please try again.');
                return;
            }
            const history = await response.json();
            chatWindow.innerHTML = '';
            if (history && Array.isArray(history)) {
                if (history.length === 0) {
                    appendMessage('No chat history found.', 'bot');
                } else {
                    history.forEach(entry => {
                        if (entry && entry.message && entry.role) {
                            appendMessage(entry.message, entry.role);
                        }
                    });
                    // Scroll to bottom after loading
                    setTimeout(() => {
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            alert('Error loading chat history: ' + error.message);
        }
    }

    async function clearChat() {
        if (!chatWindow) return;
        
        // Confirm before clearing
        const confirmed = confirm('Are you sure you want to clear the current chat?');
        if (!confirmed) return;
        
        try {
            // Stop any ongoing typing
            if (typingTimeoutId) {
                clearTimeout(typingTimeoutId);
                typingTimeoutId = null;
            }
            typingPaused = false;
            currentTypingState = null;
            
            // Hide pause button and stop generating button
            hidePauseButton();
            hideStopGeneratingButton();
            
            // Clear chat window
            chatWindow.innerHTML = '';
            
            // Clear on server
            const response = await fetch('/api/chat/current_session', { 
                method: 'DELETE' 
            });
            
            if (!response.ok) {
                console.error('Failed to clear chat on server');
            }
            
            // Add welcome message
            appendMessage('Chat cleared. How can I help you with your diabetes management?', 'bot');
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('Error clearing chat: ' + error.message);
        }
    }

    // Handle emergency messages from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emergencyMessage = urlParams.get('message');

    // Show welcome message immediately on page load (no animation, instant)
    // This ensures user sees something right away without waiting
    showWelcomeMessage();
    
    // Then load current session chat when the page loads (this will replace welcome if there's history)
    loadCurrentSessionChat().then(() => {
        if (emergencyMessage) {
            // Check if the emergency message is already in the chat history to avoid duplication
            const chatMessages = Array.from(chatWindow.children).map(el => el.textContent.trim());
            if (!chatMessages.includes(emergencyMessage)) {
                sendMessage(emergencyMessage);
            }
        }
    });

    // Handle dropdown functionality
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropbtn && dropdownContent) {
        // Toggle dropdown on button click
        dropbtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
        
        // Handle quick command clicks from dropdown
        const dropdownItems = dropdownContent.querySelectorAll('.quick-cmd');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const message = item.textContent.trim();
                if (message) {
                    sendMessage(message);
                }
                // Close dropdown after selection
                dropdownContent.classList.remove('show');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdownContent.classList.remove('show');
            }
        });
        
        // Keep dropdown open when hovering (for better UX)
        dropdown.addEventListener('mouseenter', () => {
            dropdownContent.classList.add('show');
        });
        
        dropdown.addEventListener('mouseleave', () => {
            // Small delay before closing to allow moving to dropdown
            setTimeout(() => {
                if (!dropdown.matches(':hover') && !dropdownContent.matches(':hover')) {
                    dropdownContent.classList.remove('show');
                }
            }, 200);
        });
    }

    // Handle quick command buttons (outside dropdown)
    document.querySelectorAll('.quick-cmd').forEach(btn => {
        // Skip items inside dropdown (they're handled above)
        if (!btn.closest('.dropdown-content')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                sendMessage(btn.textContent.trim());
            });
        }
    });

    // Pause/Resume button
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    if (pauseResumeBtn) {
        pauseResumeBtn.addEventListener('click', pauseResumeTyping);
    }

    // Scroll up button
    const scrollUpBtn = document.getElementById('scroll-up-btn');
    if (scrollUpBtn) {
        scrollUpBtn.addEventListener('click', () => {
            chatWindow.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll down button
    const scrollDownBtn = document.getElementById('scroll-down-btn');
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', () => {
            chatWindow.scrollTo({
                top: chatWindow.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // Detect user scrolling to disable auto-scroll
    let scrollTimeout = null;
    chatWindow.addEventListener('scroll', () => {
        // Check if user scrolled up
        const isAtBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < 50;
        autoScrollEnabled = isAtBottom;
        
        // Show/hide scroll buttons based on scroll position
        if (scrollUpBtn) {
            scrollUpBtn.style.opacity = chatWindow.scrollTop > 100 ? '1' : '0.5';
        }
        if (scrollDownBtn) {
            scrollDownBtn.style.opacity = isAtBottom ? '0.5' : '1';
        }
    });

    // Clear chat button
    const clearChatBtn = document.getElementById('clear-chat-btn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }

    // History button
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            loadArchivedChatHistory();
        });
    }
    
    // Stop generating button
    const stopGeneratingBtn = document.getElementById('stop-generating-btn');
    if (stopGeneratingBtn) {
        stopGeneratingBtn.addEventListener('click', () => {
            // If waiting for API response, cancel it
            if (isWaitingForResponse && currentAbortController) {
                currentAbortController.abort();
                isWaitingForResponse = false;
                hidePauseButton();
                hideStopGeneratingButton();
                return;
            }
            // Otherwise, stop typing generation
            stopGenerating();
        });
    }
};
