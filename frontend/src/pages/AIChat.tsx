import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  TrendingUp,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  metrics?: { label: string; value: string }[];
}

const SUGGESTED_PROMPTS = [
  "Which product generated the highest gross revenue?",
  "What is our overall profit margin and how is it distributed?",
  "How did the West region perform compared to other regions?",
  "Why is Furniture showing lower profitability than Technology?",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I am your AI Business Intelligence Analyst. I have indexed the entire retail dataset (5,903 transactions across 4 regions). How can I help you analyze performance, trends, or profitability today?",
      sender: "ai",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAnswer = (query: string): { text: string; metrics?: { label: string; value: string }[] } => {
    const q = query.toLowerCase();

    if (q.includes("highest") || q.includes("product") || q.includes("top")) {
      return {
        text: "The top revenue-generating product in the catalog is the **Canon imageCLASS 2200 Advanced Copier**, with gross sales of **$61,599.82**. It is closely followed by the Fellowes PB500 Electric Punch Binding Machine at $27,453.38.",
        metrics: [
          { label: "Top Product", value: "Canon imageCLASS 2200" },
          { label: "Gross Sales", value: "$61,599.82" },
          { label: "Category", value: "Technology" },
        ],
      };
    }

    if (q.includes("profit") || q.includes("margin") || q.includes("distribution")) {
      return {
        text: "Our overall company profit margin is approximately **12.5%** on $2.30M in revenue. **Technology** is the dominant profit contributor ($145.5K profit), followed by **Office Supplies** ($122.5K profit). Furniture generated only $18.5K due to high shipping and return rates.",
        metrics: [
          { label: "Total Profit", value: "$286,397.02" },
          { label: "Profit Margin", value: "12.5%" },
          { label: "Top Category", value: "Technology (50.8%)" },
        ],
      };
    }

    if (q.includes("region") || q.includes("west") || q.includes("east")) {
      return {
        text: "The **West region** leads all territories with **$725,457.82** in total sales (31.6% share), followed closely by the **East region** with **$678,781.24** (29.5% share). Central and South account for 21.8% and 17.1% respectively.",
        metrics: [
          { label: "West Region", value: "$725,458 (31.6%)" },
          { label: "East Region", value: "$678,781 (29.5%)" },
          { label: "Total Regions", value: "4 Territories" },
        ],
      };
    }

    if (q.includes("furniture")) {
      return {
        text: "While Furniture accounts for significant revenue, its profit is depressed ($18,451) primarily due to high return rates in tables and large bookcases, combined with standard shipping discounting.",
        metrics: [
          { label: "Furniture Profit", value: "$18,451.27" },
          { label: "Margin", value: "3.4%" },
          { label: "Action Item", value: "Review shipping subsidy" },
        ],
      };
    }

    return {
      text: `Based on an analytical scan of the sales dataset: our total revenue stands at **$2,297,200.86** across 5,009 orders with 793 active customers. December and November represent the peak seasonal sales peaks. Let me know if you would like me to drill down into a specific category or region!`,
      metrics: [
        { label: "Total Orders", value: "5,009" },
        { label: "Net Profit", value: "$286.4K" },
      ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question) return;

    const userMsg: Message = {
      id: Date.now(),
      text: question,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAnswer(question);
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metrics: response.metrics,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Chat cleared. What question can I assist you with regarding your business data?",
        sender: "ai",
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col space-y-4">
      {/* Top Banner / Controls */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Autonomous Analyst Session
            </h2>
            <p className="text-xs text-gray-500">
              Connected to analytical memory • SuperStore retail transactions
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          title="Reset conversation"
        >
          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  msg.sender === "ai"
                    ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {msg.sender === "ai" ? (
                  <Bot className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Optional Metric Highlight Cards */}
                {msg.metrics && msg.metrics.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200/70">
                    {msg.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white p-2.5 border border-gray-100 shadow-2xs"
                      >
                        <p className="text-[10px] uppercase font-bold text-gray-600">
                          {m.label}
                        </p>
                        <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    msg.sender === "user" ? "text-blue-100" : "text-gray-600"
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded hover:bg-black/5"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 text-xs text-gray-600">Synthesizing insights...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="border-t border-gray-100 bg-gray-50/70 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
            <span>Suggested Inquiries</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200/80 p-3 sm:p-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sales, profit margins, regional trends, top products..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
