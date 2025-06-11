// app/services/chatService.ts
import { Message, SendMessagePayload } from '../types/index';

export class ChatService {
  private lastTimestamp: string | null = null;
  private abortController: AbortController | null = null;

  async fetchMessages(spaceId: string): Promise<Message[]> {
    try {
      // Abort previous request if it exists
      if (this.abortController) {
        this.abortController.abort();
      }
      
      this.abortController = new AbortController();
      
      // Build URL with timestamp for long polling
      let url = `/api/spaces/${spaceId}/messages`;
      if (this.lastTimestamp) {
        url += `?lastTimestamp=${encodeURIComponent(this.lastTimestamp)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: this.abortController.signal,
      });

    //   console.log(response);
      
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const messages: Message[] = await response.json();

    //   console.log("messages -",messages);
      
      
      // Update last timestamp if we have messages
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        this.lastTimestamp = new Date(latestMessage.createdAt).toISOString();
      }
      
      return messages;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error fetching messages:', error);
      }
      return [];
    } finally {
      this.abortController = null;
    }
  }
  
  async sendMessage(payload: SendMessagePayload): Promise<Message | null> {
    try {
      const response = await fetch(`/api/spaces/${payload.spaceId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: payload.content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const message: Message = await response.json();
      console.log("message -",message);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }
  
  // Reset chat state
  reset() {
    this.lastTimestamp = null;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();