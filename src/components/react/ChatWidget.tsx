import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 20;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || messages.length >= MAX_MESSAGES) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again later or reach out via email.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-teal text-bg border-none cursor-pointer flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: "var(--chat-btn-shadow)" }}
        data-squircle="10"
        aria-label="Toggle chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="text-lg"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-lg"
            >
              🤖
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-6 z-50 w-[380px] max-h-[500px] bg-bg-elevated overflow-hidden flex flex-col"
            style={{ boxShadow: "var(--chat-shadow)", filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
            data-squircle="16"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse-dot" />
              <div>
                <p className="text-sm font-medium">Ask us anything</p>
                <p className="text-[0.65rem] text-text-tertiary">
                  Powered by Claude · About our services & work
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-text-tertiary mb-3">
                    Hi! I'm the nap of the earth AI assistant.
                  </p>
                  <p className="text-[0.75rem] text-text-tertiary">
                    Ask about our services, projects, capabilities, or anything else.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-[0.8rem] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-teal text-bg"
                        : "bg-bg-card text-text-secondary"
                    }`}
                    style={{
                      filter: msg.role === "assistant" ? "drop-shadow(0 0 0.5px var(--color-border))" : undefined,
                    }}
                    data-squircle="10"
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="bg-bg-card px-4 py-3"
                    style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
                    data-squircle="10"
                  >
                    <div className="flex gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border">
              {messages.length >= MAX_MESSAGES ? (
                <p className="text-[0.7rem] text-text-tertiary text-center py-1">
                  Message limit reached.{" "}
                  <a
                    href="mailto:dadavidtseng@gmail.com"
                    className="text-teal no-underline"
                  >
                    Email me
                  </a>{" "}
                  for more.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about our services..."
                    className="flex-1 bg-bg px-3.5 py-2 text-[0.8rem] text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
                    style={{ filter: "drop-shadow(0 0 0.5px var(--color-border))" }}
                    data-squircle="8"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-teal text-bg border-none px-4 py-2 text-[0.8rem] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85 transition-opacity"
                    data-squircle="8"
                  >
                    Send
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
