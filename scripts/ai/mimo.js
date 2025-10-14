function mimoAI() {
  return {
		chatbotOpen: false,
		activeTab: 'chat',
		webSearch: false,
		message: '',
		type: '',
		reply: '',
		error: '',
		loading: false,
		conversationHistory: [],
		chatMessages: [
			{
				type: 'bot',
				message: 'Hello, Welcome to Sizemug. I\'m Mimo 👋, how can I help you?',
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			}
		],
		 suggestions: [
			"What’s new in the latest Sizemug update?",
			"What’s included in the premium plan?",
			"How do I upgrade my subscription?",
			"Can I get a free trial before upgrading?",
			"Where do I update my payment method?",
			"What happens if my payment fails?",
			"How do I report a bug or send feedback?",
			"How do I restore default settings?",
			"Can I connect Sizemug to my calendar app?",
      "How can I stay focused while working remotely?",
      "What’s the best time management method?",
      "How do I avoid procrastination?",
      "Suggest a daily productivity schedule.",
      "How can Sizemug help me plan my tasks?"
    ],

    useSuggestion(suggestion) {
      this.message = suggestion;
      this.activeTab = 'chat';
    },

		async chatWithMimo() {
			const userMessage = this.message.trim();
			if (!userMessage) return;

			this.reply = '';
			this.error = '';
			this.loading = true;

			const userEntry = {
        role: "user",
        content: userMessage
      };
			this.chatMessages.push({
        type: 'user',
        message: userMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
			this.conversationHistory.push(userEntry);

			if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

			this.$nextTick(() => {
        const chat = this.$refs.chatContainer;
        chat.scrollTop = chat.scrollHeight;
      });

			try {
				const res = await fetch('https://dev.supabase.co/functions/v1/Mimo', {
					method: 'POST',
					headers: {
					'Content-Type': 'application/json',
					},
					body: JSON.stringify({ 
						message: this.message, 
						history: this.conversationHistory,
						webSearch: this.webSearch
					})
				});

				const data = await res.json();

				if (res.ok && data.reply) {
					this.reply = data.reply;

					const botEntry = {
            role: "assistant",
            content: data.reply
          };
					this.conversationHistory.push(botEntry);

					this.chatMessages.push({
            type: 'bot',
            message: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

					// this.$nextTick(() => {
          //   const chat = this.$refs.chatContainer;
          //   chat.scrollTop = chat.scrollHeight;
          // });
				} else if (data.error) {
					this.error = data.error;
				} else {
					this.error = 'Unknown error occurred.';
				}
			} catch (err) {
				this.error = 'Network or server error. Please try again.';
				console.error('Fetch error:', err);
			} finally {
				this.message = '';
				this.loading = false;
			}
		}
  };
}
