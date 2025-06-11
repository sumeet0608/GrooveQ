// app/components/Chat.tsx
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { chatService } from '@/lib/chat-service';
import { Message } from '../types/index';
import { getMail } from '@/app/action';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ChatProps {
  spaceId: string;
  isCreator:boolean
}

export default function Chat({ spaceId, isCreator }: ChatProps) {

  
  const [email, setEmail] = useState('')
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [disableChat, setDisableChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const router = useRouter()

  async function fetchMail() {
    const mail = await getMail()
    setEmail(mail)
  }
  useEffect(() => {
    fetchMail()
  }, [])

  const scrollToBottom = () => {
    if (messagesEndRef.current && isAtBottom.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      isAtBottom.current = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    }
  };

  
    useEffect(() => {
      chatfn();
      const interval = setInterval(chatfn, 10*1000);
      return () => clearInterval(interval);
    }, []);
    

  const  chatfn = async()=>{
    const res = await fetch(`/api/spaces/${spaceId}/messages/disableChat`)
    const data = await res.json()
    setDisableChat(data?.chatDisabled);
  }

  const  setchat = async()=>{
    try {
      const res = await fetch(`/api/spaces/${spaceId}/messages/disableChat`,{
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ disableChat })
      })
      const data = await res.json()
      // console.log(data);
      
      setDisableChat(data?.chatDisabled);
    } catch (error) {
        // console.log(error);
        
    }finally{
      if(disableChat === true)
        toast.success("Chat enabled successfully")
      else
        toast.success("Chat disabled successfully")
    }
  }
    
    


  useEffect(() => {
    
    if (disableChat === true)
      return
    const loadInitialMessages = async () => {
      setLoading(true);
      chatService.reset();
      const initialMessages = await chatService.fetchMessages(spaceId);
      // console.log("ini msgs = ", initialMessages);
      if(initialMessages == null){

        setLoading(false);
      }else{

        setMessages(initialMessages);
        setLoading(false);
      }
    };

    loadInitialMessages();

    return () => {
      chatService.reset();
    };
  }, [spaceId, disableChat]);


  useEffect(() => {
    if (disableChat === true)
      return
    let isMounted = true;

    const pollMessages = async () => {
      try {
        while (isMounted) {
          const newMessages = await chatService.fetchMessages(spaceId);
          // console.log(newMessages);
  
          if (isMounted && newMessages.length > 0) {
            setMessages(prevMessages => {
              const filtered = prevMessages.filter(msg =>
                !(msg.id.startsWith('temp-') && newMessages.some(newMsg =>
                  newMsg.content === msg.content &&
                  newMsg.user.email === msg.user.email
                ))
              );
  
              const existingIds = new Set(filtered.map(msg => msg.id));
              const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
  
              return [...filtered, ...uniqueNewMessages];
            });
  
          }
  
  
        }
      } catch (error) {
        // throw new 
          // console.log(error);
          
      }
    };

    pollMessages();

    return () => {
      isMounted = false;
    };
  }, [spaceId]);


  useEffect(() => {
    if (disableChat === true)
      return
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    if (disableChat === true)
      return
    e.preventDefault();

    if (!newMessage.trim()) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      user: {
        email: email,
      },
      spaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setMessages(prev => [...prev]);
    setNewMessage('');


    await chatService.sendMessage({
      content: newMessage,
      spaceId,
    });

    // isAtBottom.current = true;
    // scrollToBottom();
  };

  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full border-spacing-3 border-white bg-black rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-900 border-b border-white flex justify-between">
        <h3 className="text-lg font-medium text-white">Chat</h3>
        <div>


        {isCreator === true ?
        
        (!isPending && disableChat === false?
        
          (<Button className='bg-red-900 hover:bg-red-800 cursor-pointer' onClick={() => startTransition(() => setchat())}>
            {isPending ? <Loader2 className='animate-spin' /> : "disable"}
          </Button>):(
            <Button className='bg-green-800 hover:bg-green-700 cursor-pointer' onClick={() => startTransition(() => setchat())}>
            {isPending ? <Loader2 className='animate-spin' /> : "enable"}
          </Button>
          )):(<div/>)
          }
          
       
          </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto" onScroll={handleScroll}>
        {disableChat === true &&


          <div className="flex justify-center items-center h-full text-gray-400">
            Chat disabled, Please refresh in case a mistake.
          </div>

        }
        {!disableChat && loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          </div>
        ) : !disableChat && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {!disableChat && messages.map((message) => {
              const isCurrentUser = message.user.email === email

              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end max-w-[75%] gap-2`}
                  >
                    <div>
                      <div
                        className={`px-4 py-2 rounded-lg ${isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-100"
                          }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                        {message.user.name ?? message.user.email} • {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-white bg-gray-900">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            placeholder="Type a message..."
            value={newMessage}
            disabled={disableChat}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:none"
            disabled={!newMessage.trim() || disableChat === true}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
