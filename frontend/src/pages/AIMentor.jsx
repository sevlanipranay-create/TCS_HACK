import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import AIResponseCard from '../components/ai/AIResponseCard.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  Sparkles,
  Send,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileQuestion,
  Mic,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  { id: 'challenge', label: '🔍 Challenge My Idea', actionType: 'challenge' },
  { id: 'prioritize', label: '🎯 Prioritize My MVP', actionType: 'prioritize' },
  { id: 'weaknesses', label: '⚠ Find Weaknesses', actionType: 'weaknesses' },
  { id: 'alternatives', label: '💡 Give Alternatives', actionType: 'general' },
  { id: 'testcases', label: '🧪 Generate Test Cases', actionType: 'general' },
  { id: 'improve', label: '🚀 Improve My Solution', actionType: 'general' },
  { id: 'judges', label: '🎤 Prepare Me for Judges', actionType: 'general' }
];

export const AIMentor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'mentor',
      type: 'advice',
      title: 'Mentor Greeting & Status Assessment',
      content: 'Welcome team NeuroCoders. I have full context of your project: "EcoRoute: AI Green Delivery Logistics" (4 team members, 2h 15m remaining). Your biggest current danger is feature creep in the MVP and an unverified user validation score (60%). What would you like to stress-test right now?',
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (textToSend, actionType = 'general') => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: query,
      time: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const mentorRes = await api.askMentor(query, actionType);
      const mentorMsg = {
        id: `m-${Date.now()}`,
        sender: 'mentor',
        type: mentorRes.type,
        title: mentorRes.title,
        content: mentorRes.content,
        time: 'Just now'
      };
      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (qa) => {
    handleSendMessage(`[${qa.label}] Please advise our team based on our current EcoRoute architecture.`, qa.actionType);
  };

  return (
    <PageContainer
      title="💬 AI Hackathon Mentor"
      subtitle="Context-aware senior advisor challenging your assumptions, trimming your scope, and coaching you for judge questions."
      badge={<Badge variant="mint" size="sm">Senior Mentor Active</Badge>}
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/judge')}
          icon={Target}
        >
          Launch Judge Mode
        </Button>
      }
    >
      {/* Project Context Pill Header */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#051F20]">Active Context:</span>
            <span className="bg-[#DAF1DE] text-[#051F20] px-2.5 py-0.5 rounded-full font-semibold">
              EcoRoute (Logistics & Carbon)
            </span>
            <span className="text-[#71877E]">•</span>
            <span className="text-[#49645C]">Solution A (K-Means Heuristic)</span>
          </div>

          <div className="flex items-center gap-3 text-[#71877E]">
            <span>Time Left: <strong className="text-[#051F20]">02h 15m</strong></span>
            <span>Readiness: <strong className="text-[#4F8A6A]">82/100</strong></span>
          </div>
        </div>
      </Card>

      {/* Quick Action Prompt Shortcuts */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#71877E] px-1">
          Mentor Quick Actions
        </span>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              onClick={() => handleQuickAction(qa)}
              disabled={loading}
              className="text-xs font-semibold px-3 py-2 rounded-[11px] bg-white border border-[#DAF1DE] hover:border-[#8EB69B] hover:bg-[#DAF1DE]/40 text-[#051F20] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Feed Container */}
      <div className="space-y-4 min-h-[420px]">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-fadeIn">
                <div className="max-w-xl p-3.5 rounded-[16px] rounded-br-xs bg-[#051F20] text-white text-xs md:text-sm shadow-xs space-y-1">
                  <div className="flex items-center justify-between gap-4 text-[10px] text-[#DAF1DE]/70">
                    <span className="font-bold">Team Question</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-start animate-fadeIn">
              <div className="max-w-2xl w-full">
                <AIResponseCard
                  title={msg.title || 'AI Mentor Advice'}
                  category={msg.type === 'challenge' ? 'Hard Challenge' : msg.type === 'weakness' ? 'Risk Alert' : 'Guidance'}
                  actions={
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/judge')}
                      >
                        Test in Judge Mode →
                      </Button>
                      <Button
                        variant="mint"
                        size="sm"
                        onClick={() => navigate('/mvp-tech')}
                      >
                        Adjust Scope
                      </Button>
                    </div>
                  }
                >
                  <p className="text-xs md:text-sm text-[#051F20] leading-relaxed">
                    {msg.content}
                  </p>
                </AIResponseCard>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <Card variant="white" radius="lg" className="p-4 border border-[#8EB69B]/40 max-w-sm">
              <div className="flex items-center gap-3 text-xs text-[#49645C]">
                <div className="w-4 h-4 rounded-full border-2 border-[#8EB69B] border-t-transparent animate-spin" />
                <span>AI Mentor is evaluating current project constraints...</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input Message Box */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/40 p-3 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask mentor: 'How do we convince judges of our carbon savings?' or 'Should we cut feature X?'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#051F20] focus:outline-none placeholder:text-[#71877E]/70"
          />
          <Button
            type="submit"
            variant="mint"
            size="md"
            loading={loading}
            disabled={!inputText.trim()}
            icon={Send}
          >
            Send
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};

export default AIMentor;
