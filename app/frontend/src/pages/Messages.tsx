import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppShell, EmptyState, ErrorState, MemberAvatar, PageGate, PageHeader, VerifiedMark } from '@/components/sakan';
import { errDetail, sakanApi } from '@/lib/sakan';
import type { ChatMessage, Conversation, MeState } from '@/lib/sakan';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Messages() {
  return (
    <PageGate>
      {(me: MeState, reloadMe: () => Promise<void>) => <MessagesBody me={me} reloadMe={reloadMe} />}
    </PageGate>
  );
}

function MessagesBody({ me, reloadMe }: { me: MeState; reloadMe: () => Promise<void> }) {
  const [searchParams] = useSearchParams();
  const initialConversation = Number(searchParams.get('c')) || null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(initialConversation);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(!initialConversation);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const loadConversations = useCallback(async () => {
    try {
      const res = await sakanApi.conversations();
      setConversations(res.items);
    } catch (e) {
      setError(errDetail(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await sakanApi.messages(conversationId);
      setMessages(res.items);
    } catch (e) {
      if (!silent) toast.error(errDetail(e));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // open initial conversation from ?c=
  useEffect(() => {
    if (initialConversation) {
      setActiveId(initialConversation);
      setShowListOnMobile(false);
      loadMessages(initialConversation);
      reloadMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversation]);

  // poll active conversation every 4s (silent refresh keeps chat live)
  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(() => {
      loadMessages(activeId, true);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const openConversation = (conversation: Conversation) => {
    setActiveId(conversation.id);
    setShowListOnMobile(false);
    setMessages([]);
    loadMessages(conversation.id);
    setConversations((prev) => prev.map((c) => (c.id === conversation.id ? { ...c, unread_count: 0 } : c)));
    reloadMe();
  };

  const send = async () => {
    const content = input.trim();
    if (!content || !activeId || sending) return;
    setSending(true);
    try {
      const message = await sakanApi.sendMessage(activeId, content);
      setMessages((prev) => [...prev, message]);
      setInput('');
      loadConversations();
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell me={me}>
      <PageHeader title="Messages" arabic="رسائلك" subtitle="Conversations stay private and respectful." />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadConversations} />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          body="Visit a profile in Discover and tap Message to start a purposeful conversation."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {/* list */}
          <div className={cn('space-y-2', !showListOnMobile && 'hidden lg:block')}>
            {conversations.map((c) => (
              <button
                key={c.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border hairline bg-card p-3 text-left transition-colors hover:bg-secondary/50',
                  activeId === c.id && 'border-primary/50 bg-secondary/60',
                )}
                onClick={() => openConversation(c)}
              >
                <MemberAvatar objectKey={c.counterpart_avatar_object_key} name={c.counterpart_display_name} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-medium">{c.counterpart_display_name}</p>
                    {c.counterpart_is_verified && <VerifiedMark />}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{c.last_message_text || 'No messages yet'}</p>
                </div>
                {c.unread_count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* chat pane */}
          <div className={cn('flex h-[65vh] flex-col rounded-xl border hairline bg-card', showListOnMobile && 'hidden lg:flex')}>
            {active ? (
              <>
                <div className="flex items-center gap-3 border-b hairline p-3">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowListOnMobile(true)} aria-label="Back to conversations">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <MemberAvatar objectKey={active.counterpart_avatar_object_key} name={active.counterpart_display_name} className="h-9 w-9" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium">{active.counterpart_display_name}</p>
                      {active.counterpart_is_verified && <VerifiedMark />}
                    </div>
                    <p className="text-xs text-muted-foreground">Private conversation</p>
                  </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="pt-8 text-center text-sm text-muted-foreground">
                      Say salaam and introduce yourself. Keep it respectful — this is the beginning of something serious.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={cn('flex', m.is_mine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                            m.is_mine
                              ? 'rounded-br-md bg-primary text-primary-foreground'
                              : 'rounded-bl-md bg-secondary text-secondary-foreground',
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p className={cn('mt-1 text-[10px]', m.is_mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  className="flex gap-2 border-t hairline p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write a message…"
                    maxLength={2000}
                  />
                  <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Send message">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select a conversation to begin.
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
