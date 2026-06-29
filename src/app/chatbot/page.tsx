import ChatInterface from '@/components/chatbot/chat-interface';

export default function ChatbotPage() {
  return (
    <div className="container py-8 mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground mt-2">Your personalized competitive programming mentor with conversational memory.</p>
      </div>

      <ChatInterface />
    </div>
  );
}
