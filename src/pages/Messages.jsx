import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMessageThreads, getMessageThread, sendMessage } from "../lib/api";

const POLL_MS = 5000;

export default function Messages() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null); // { id, name, listingId?, listingTitle? }
  const [conversation, setConversation] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const conversationRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }

    const incoming = location.state;
    if (incoming?.recipientId) {
      setSelected({
        id: incoming.recipientId,
        name: incoming.recipientName,
        listingId: incoming.listingId,
        listingTitle: incoming.listingTitle,
      });
    }
  }, [user, loading]);

  const refreshThreads = () => {
    if (!user) return;
    getMessageThreads(token).then(setThreads).catch(() => {});
  };

  useEffect(() => {
    refreshThreads();
    const interval = setInterval(refreshThreads, POLL_MS);
    return () => clearInterval(interval);
  }, [user, token]);

  const refreshConversation = () => {
    if (!selected) return;
    getMessageThread(selected.id, token).then(setConversation).catch(() => {});
  };

  useEffect(() => {
    prevMessageCountRef.current = 0;
    refreshConversation();
    const interval = setInterval(refreshConversation, POLL_MS);
    return () => clearInterval(interval);
  }, [selected?.id, token]);

  // Only jump to the latest message when new ones actually arrive, and scroll
  // just the message list — not the whole page — so polling every few
  // seconds doesn't yank the page around or fight a user reading upwards.
  useEffect(() => {
    if (conversation.length > prevMessageCountRef.current && conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
    prevMessageCountRef.current = conversation.length;
  }, [conversation]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return null;

  const openThread = (t) => setSelected({ id: t.other_user_id, name: t.other_user_name });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !selected) return;
    setSending(true);
    try {
      await sendMessage({ recipient_id: selected.id, body: draft.trim(), listing_id: selected.listingId }, token);
      setDraft("");
      refreshConversation();
      refreshThreads();
    } catch {
      // leave the draft in place so the user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare size={22} className="text-primary-400" /> Messages
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ minHeight: 480 }}>
          {/* Thread list */}
          <div className="md:col-span-1 border-r border-gray-100">
            {threads.length === 0 && !selected ? (
              <p className="p-5 text-sm text-gray-400">No conversations yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {threads.map(t => (
                  <button key={t.other_user_id} onClick={() => openThread(t)}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition ${selected?.id === t.other_user_id ? "bg-primary-50" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{t.other_user_name}</span>
                      {t.unread_count > 0 && (
                        <span className="bg-primary-400 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">{t.unread_count}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{t.last_message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conversation */}
          <div className="md:col-span-2 flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="font-semibold text-gray-900 text-sm">{selected.name}</div>
                  {selected.listingTitle && <div className="text-xs text-gray-400">Re: {selected.listingTitle}</div>}
                </div>
                <div ref={conversationRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 360 }}>
                  {conversation.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${m.sender_id === user.id ? "bg-primary-400 text-white" : "bg-gray-100 text-gray-800"}`}>
                        {m.body}
                        <div className={`text-[10px] mt-1 ${m.sender_id === user.id ? "text-white/70" : "text-gray-400"}`}>
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Type a message…"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-400" />
                  <button type="submit" disabled={sending || !draft.trim()}
                    className="bg-primary-400 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-60">
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
