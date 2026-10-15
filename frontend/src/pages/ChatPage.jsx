import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../state/SessionContext.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SourceTag from '../components/SourceTag.jsx';
import Spinner from '../components/Spinner.jsx';
import { Sparkles, Send, ShieldAlert, Lightbulb, Target, ArrowRight } from '../components/common/Icons.jsx';
import { STAGES } from '../lib/contract.js';

const STAGE_LABELS = {
  understand: '1. Understand (Restate problem & surface assumptions)',
  users: '2. Users (Personas & rapid validation)',
  ideate: '3. Ideate (2-3 options with trade-offs)',
  build: '4. Build (Scope MVP & build sequence)',
  validate: '5. Validate (Edge cases & test criteria)',
  pitch: '6. Pitch (Jury outline & demo flow)'
};

const QUICK_PROMPTS = [
  'What are the 3 biggest risks or unproven assumptions in our project?',
  'How should we cut down our MVP scope if time runs out?',
  'What technical trade-offs exist between our frontend and backend?',
  'What tough questions will the jury likely grill us on during the pitch?'
];

export function ChatPage() {
  const {
    brief,
    messages,
    sendMessage,
    setPage,
    loading
  } = useSession();

  const [selectedStage, setSelectedStage] = useState('understand');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage('');
    setIsSending(true);

    try {
      await sendMessage(text, selectedStage);
    } catch (_) {
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!brief) {
    return (
      <PageContainer title="03 Stage-Aware AI Mentor Chat">
        <EmptyState
          icon="💬"
          title="Create a brief first"
          description="The AI Hackathon Mentor uses your problem brief, MVP scope, and team capacity to coach you through each sprint stage."
          actionLabel="Go to Mentor Brief"
          onAction={() => setPage('brief')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="03 Stage-Aware AI Mentor Chat"
      subtitle="Coaching on trade-offs, architecture, and pitch preparedness. Leads with questions — never writes complete code."
      badge={<Badge variant="mint" size="sm">Coaching Mode Active</Badge>}
    >
      {/* Quick Prompts Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#71877E] shrink-0">Quick prompts:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={isSending}
            className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#DAF1DE] hover:border-[#8EB69B] text-[#051F20] font-medium shrink-0 transition-all shadow-2xs hover:bg-[#EAF6EA]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Chat Shell */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm flex flex-col h-[650px] p-0 overflow-hidden">
        {/* Stage Selector Header */}
        <div className="p-4 bg-[#EAF6EA]/60 border-b border-[#DAF1DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="chat-stage-select" className="text-xs font-bold text-[#051F20]">
              Current Sprint Stage:
            </label>
            <select
              id="chat-stage-select"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold text-[#051F20] bg-white border border-[#8EB69B]/40 outline-none"
            >
              {STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {STAGE_LABELS[stg] || stg}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] font-semibold text-[#49645C]">
            Stage Rule: Mentor guides choices • Your team decides
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center my-auto py-12 text-[#71877E] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6EA] border border-[#8EB69B]/30 text-xl flex items-center justify-center mx-auto mb-2">
                🤖
              </div>
              <h4 className="text-sm font-bold text-[#051F20]">
                Stage-Aware Mentor Ready
              </h4>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                Ask about trade-offs in {selectedStage}, rapid validation tests, or architecture choices.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-[16px] p-4 shadow-2xs ${
                      isUser
                        ? 'bg-[#051F20] text-white'
                        : 'bg-white border border-[#DAF1DE] text-[#051F20]'
                    }`}
                  >
                    {/* Meta info */}
                    <div
                      className={`flex items-center gap-2 mb-1.5 text-[11px] ${
                        isUser ? 'text-[#8EB69B]' : 'text-[#71877E]'
                      }`}
                    >
                      <strong className="font-bold">{isUser ? 'Your Team' : 'Mentor AI'}</strong>
                      <span>•</span>
                      <span>Stage: {msg.stage}</span>
                      {msg.source && <SourceTag source={msg.source} />}
                    </div>

                    {/* Content */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Guardrail Triggered Notice */}
                    {msg.guardrail_triggered && (
                      <div className="mt-3 p-3 rounded-[10px] bg-[#C99A3D]/12 border-l-4 border-[#C99A3D] text-xs font-semibold text-[#8C651A] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-[#C99A3D]" />
                        <span>The mentor stayed in coach mode: it guides, you build.</span>
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#DAF1DE] space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#49645C]">
                          Follow-up coaching questions:
                        </span>
                        <div className="space-y-1">
                          {msg.follow_up_questions.map((fq, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSend(fq)}
                              className="text-left w-full text-xs p-2 rounded-lg bg-[#EAF6EA]/80 hover:bg-[#DAF1DE] text-[#051F20] transition-colors flex items-center justify-between"
                            >
                              <span>{fq}</span>
                              <ArrowRight className="w-3 h-3 text-[#8EB69B] shrink-0 ml-1.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-center gap-2 p-3 text-xs text-[#49645C]">
              <Spinner size={14} color="var(--color-brand-mint)" />
              <span>Mentor is analyzing sprint context...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Bar */}
        <div className="p-3 bg-[#FAFCFA] border-t border-[#DAF1DE]">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              id="chat-input"
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder={`Ask a coaching question about the ${selectedStage} stage... (Enter to send, Shift+Enter for new line)`}
              className="flex-1 p-3 rounded-[12px] border border-[#DAF1DE] bg-white text-sm text-[#051F20] focus:border-[#8EB69B] outline-none resize-none leading-relaxed"
            />

            <Button
              variant="primary"
              size="md"
              disabled={!inputMessage.trim() || isSending}
              onClick={() => handleSend()}
              icon={Send}
              id="btn-send-chat"
              className="h-[46px] px-5"
            >
              {isSending ? <Spinner size={14} color="#FFFFFF" /> : 'Send'}
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

export default ChatPage;
