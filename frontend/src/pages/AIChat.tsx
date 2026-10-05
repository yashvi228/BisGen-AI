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
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  metrics?: { label: string; value: string }[];
  recommendation?: string;
  followUps?: string[];
  feedback?: "up" | "down" | null;
}

const CATEGORY_PROMPTS: Record<string, string[]> = {
  All: [
    "Which product generated the highest gross revenue?",
    "What is our overall profit margin and how is it distributed?",
    "How did the West region perform compared to other regions?",
    "Why is Furniture showing lower profitability than Technology?",
  ],
  Revenue: [
    "What were the peak revenue months in 2019?",
    "Which product generated the highest gross revenue?",
    "What is our average monthly sales run rate?",
  ],
  Profitability: [
    "What is our overall profit margin and how is it distributed?",
    "Why is Furniture showing lower profitability than Technology?",
    "How can we improve margins on discounted catalog items?",
  ],
  Regions: [
    "How did the West region perform compared to other regions?",
    "What is the market share breakdown across the 4 territories?",
    "Which region had the lowest return rate?",
  ],
};

interface AIChatProps {
  onShowToast?: (message: string) => void;
}

export default function AIChat({ onShowToast }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I am your AI Business Intelligence Analyst. I have indexed 5,903 retail transactions across 4 geographic regions. What business decisions, margin analyses, or performance trends would you like to explore?",
      sender: "ai",
      timestamp: "Just now",
      followUps: [
        "Which product generated the highest gross revenue?",
        "What is our overall profit margin?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedPromptCategory, setSelectedPromptCategory] = useState("All");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAnswer = (query: string): {
    text: string;
    metrics?: { label: string; value: string }[];
    recommendation?: string;
    followUps?: string[];
  } => {
    const q = query.toLowerCase();

    if (q.includes("highest") || q.includes("product") || q.includes("top")) {
      return {
        text: "The top revenue-generating product in the catalog is the **Canon imageCLASS 2200 Advanced Copier**, with gross sales of **$61,599.82**. It is followed by the Fellowes PB500 Electric Punch Binding Machine ($27,453.38) and Cisco TelePresence System ($22,638.48).",
        metrics: [
          { label: "Top Product", value: "Canon imageCLASS 2200" },
          { label: "Gross Sales", value: "$61,599.82" },
          { label: "Category", value: "Technology" },
        ],
        recommendation: "Ensure inventory buffer stock for high-value copiers and explore extended service contracts to capture additional post-sale margins.",
        followUps: [
          "What are the top 5 products by revenue?",
          "How profitable is the Canon imageCLASS?",
        ],
      };
    }

    if (q.includes("profit") || q.includes("margin") || q.includes("distribution")) {
      return {
        text: "Our overall company profit margin is approximately **12.5%** on $2.30M in revenue. **Technology** contributes 50.8% of total profit ($145.5K), followed by **Office Supplies** at 42.8% ($122.5K). In contrast, Furniture contributes only 6.4% ($18.5K) despite driving 32% of total sales.",
        metrics: [
          { label: "Total Net Profit", value: "$286,397.02" },
          { label: "Overall Margin", value: "12.5%" },
          { label: "Top Category", value: "Technology (50.8%)" },
        ],
        recommendation: "Re-evaluate discount schedules on bulky Furniture items (tables & bookcases) and adjust shipping subsidies.",
        followUps: [
          "Why is Furniture profitability so low?",
          "Show monthly profit trend for Technology",
        ],
      };
    }

    if (q.includes("region") || q.includes("west") || q.includes("east") || q.includes("territor")) {
      return {
        text: "The **West territory** leads with **$725,457.82** in total sales (31.6% market volume share), followed closely by the **East territory** with **$678,781.24** (29.5% share). Central ($501.2K, 21.8%) and South ($391.7K, 17.1%) represent key growth expansion opportunities.",
        metrics: [
          { label: "West Region", value: "$725,458 (31.6%)" },
          { label: "East Region", value: "$678,781 (29.5%)" },
          { label: "Central + South", value: "$892,962 (38.9%)" },
        ],
        recommendation: "Deploy targeted B2B corporate marketing in Central and South to close the 14% revenue delta with the coastal territories.",
        followUps: [
          "Which products sell best in the West?",
          "Compare return rates across regions",
        ],
      };
    }

    if (q.includes("furniture") || q.includes("discount")) {
      return {
        text: "While Furniture accounts for substantial gross sales ($742K), its net profit is depressed to $18,451 (3.4% margin). Root-cause analysis shows higher shipping costs on heavy items (desks/tables) and aggressive promotions exceeding 20% discounts.",
        metrics: [
          { label: "Furniture Profit", value: "$18,451.27" },
          { label: "Profit Margin", value: "3.4%" },
          { label: "Primary Bottleneck", value: "Heavy Freight & Discounts" },
        ],
        recommendation: "Cap promotional discounts on tables to 12% maximum and introduce freight surcharge for non-standard delivery.",
        followUps: [
          "What is the return rate for Furniture?",
          "How did Office Supplies perform?",
        ],
      };
    }

    return {
      text: `Based on DuckDB analytical indexing: Total revenue stands at **$2,297,200.86** across 5,009 orders with 793 active accounts. Seasonal peak volume occurred in November ($352K) and December ($453K). Let me know if you would like me to isolate a specific territory or product family!`,
      metrics: [
        { label: "Total Orders", value: "5,009" },
        { label: "Total Profit", value: "$286.4K" },
      ],
      recommendation: "Prepare holiday procurement campaigns by late August to capitalize on the Q4 volume surge.",
      followUps: [
        "Which product generated the highest gross revenue?",
        "What is our overall profit margin?",
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
        recommendation: response.recommendation,
        followUps: response.followUps,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 700);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast?.("Copied AI analysis to clipboard");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleFeedback = (id: number, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, feedback: msg.feedback === type ? null : type } : msg
      )
    );
    onShowToast?.(type === "up" ? "Thanks for your feedback!" : "Feedback recorded.");
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Session cleared. What questions can I assist you with regarding your business data?",
        sender: "ai",
        timestamp: "Just now",
        followUps: [
          "Which product generated the highest gross revenue?",
          "What is our overall profit margin?",
        ],
      },
    ]);
    onShowToast?.("Chat history reset");
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col space-y-4">
      {/* Top Banner / Session Info */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                AI Business Analyst Copilot
              </h2>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                DuckDB Indexed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Natural language analytical reasoning connected to 5,903 retail transactions
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          title="Reset conversation"
        >
          <Trash2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset Session</span>
        </button>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  msg.sender === "ai"
                    ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {msg.sender === "ai" ? (
                  <Bot className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>

              {/* Message Bubble & Cards */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/70"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Structured Metric Highlight Cards */}
                {msg.metrics && msg.metrics.length > 0 && (
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5 border-t border-slate-200/70">
                    {msg.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs"
                      >
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {m.label}
                        </p>
                        <p className="text-xs font-extrabold text-blue-600 mt-0.5 tabular-nums">
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Executive Recommendation Highlight Card */}
                {msg.recommendation && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/80 p-3 border border-amber-200/70 text-amber-900 text-xs">
                    <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Strategic Recommendation: </span>
                      <span>{msg.recommendation}</span>
                    </div>
                  </div>
                )}

                {/* Follow-up suggestions */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-200/60">
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                      Suggested follow-ups:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(fu)}
                          className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs text-blue-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors shadow-2xs font-medium"
                        >
                          <span>{fu}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp & action buttons */}
                <div
                  className={`mt-2.5 flex items-center justify-between text-[10px] ${
                    msg.sender === "user" ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.sender === "ai" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFeedback(msg.id, "up")}
                        className={`p-1 rounded transition-colors ${
                          msg.feedback === "up"
                            ? "text-blue-600 bg-blue-100/50"
                            : "hover:text-slate-700 hover:bg-slate-200/50"
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, "down")}
                        className={`p-1 rounded transition-colors ${
                          msg.feedback === "down"
                            ? "text-rose-600 bg-rose-100/50"
                            : "hover:text-slate-700 hover:bg-slate-200/50"
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
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
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-200/80 bg-slate-50 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 text-xs font-medium text-slate-500">Scanning DuckDB transactions...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Inquiries with Category Tabs */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
              <span>Executive Query Templates</span>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1">
              {Object.keys(CATEGORY_PROMPTS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedPromptCategory(cat)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
                    selectedPromptCategory === cat
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(CATEGORY_PROMPTS[selectedPromptCategory] || CATEGORY_PROMPTS.All).map(
              (prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 font-medium"
                >
                  {prompt}
                </button>
              )
            )}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="border-t border-slate-200/80 p-3 sm:p-4 bg-white">
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
                placeholder="Ask about sales trends, territory anomalies, profit margins, top products..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
