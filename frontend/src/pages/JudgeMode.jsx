import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Textarea from '../components/common/Textarea.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  Scale,
  Sparkles,
  Send,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const JudgeMode = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getJudgeQuestions().then((data) => {
      setQuestions(data || []);
      setLoading(false);
    });
  }, []);

  const currentQ = questions[currentIndex] || null;

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !currentQ) return;
    setEvaluating(true);
    try {
      const res = await api.submitJudgeAnswer(currentQ.id, answerText);
      setEvaluation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setAnswerText('');
    setCurrentIndex((prev) => (prev + 1 < questions.length ? prev + 1 : 0));
  };

  const handleTryAgain = () => {
    setEvaluation(null);
  };

  const handleFillStrong = () => {
    if (currentQ) {
      setAnswerText(currentQ.sampleStrongAnswer);
    }
  };

  const handleFillWeak = () => {
    if (currentQ) {
      setAnswerText(currentQ.sampleWeakAnswer);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Entering TCS Hackathon Judging Chamber..." />
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-[#051F20] text-white p-4 md:p-8 space-y-6">
      {/* Top Authoritative Judging Header */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#163832]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B2B26] border border-[#8EB69B]/40 flex items-center justify-center text-xl shadow-lg">
            ⚖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8EB69B]">
                TCS HACKATHON EVALUATION CHAMBER
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#C75C5C]/20 text-[#C75C5C] font-bold">
                Live Simulation
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Judge Mode Simulation
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs border-[#8EB69B]/40 text-[#DAF1DE]"
          >
            ← Back to Dashboard
          </Button>
          <Button
            variant="mint"
            size="sm"
            onClick={() => navigate('/readiness')}
            icon={Award}
          >
            View Readiness Score
          </Button>
        </div>
      </div>

      {/* Main Judging Panel Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Question Tracker Header */}
        <div className="flex items-center justify-between text-xs text-[#DAF1DE]">
          <span className="font-bold text-[#8EB69B]">
            QUESTION {currentIndex + 1} OF {questions.length}
          </span>
          <span className="text-[#71877E]">Category: {currentQ?.category}</span>
        </div>

        {/* The Judge's Question Card */}
        <div className="p-6 md:p-8 rounded-[20px] bg-[#0B2B26] border border-[#163832] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8EB69B]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8EB69B]">
              <Sparkles className="w-4 h-4" />
              Senior TCS Judge Prompt
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              "{currentQ?.question}"
            </h2>

            {currentQ?.hint && (
              <div className="p-3 rounded-lg bg-[#051F20]/70 border border-[#163832] text-xs text-[#DAF1DE]/90 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#8EB69B] shrink-0 mt-0.5" />
                <span>
                  <strong>Judge Evaluation Focus:</strong> {currentQ.hint}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* EVALUATION RESULTS CARD (Appears after submission) */}
        {evaluation && (
          <div className="p-6 rounded-[20px] bg-white text-[#051F20] shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#71877E]">
                  Evaluation Complete
                </span>
                <h3 className="text-xl font-black text-[#051F20]">
                  Judicial Scorecard & Breakdown
                </h3>
              </div>
              <Badge variant="mint" size="md">
                Audited Response
              </Badge>
            </div>

            {/* Score Grid (out of 10) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(evaluation.score || {}).map(([dim, val]) => {
                const label = dim.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                return (
                  <div key={dim} className="p-3 rounded-[12px] bg-[#EAF6EA]/50 border border-[#DAF1DE] text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#71877E] uppercase block truncate">
                      {label}
                    </span>
                    <span className="text-2xl font-black text-[#051F20]">
                      {val}<span className="text-xs text-[#71877E] font-normal">/10</span>
                    </span>
                    <ProgressBar value={val * 10} size="sm" variant={val >= 8 ? 'success' : 'mint'} />
                  </div>
                );
              })}
            </div>

            {/* Judge Feedback Quote */}
            <div className="p-4 rounded-[14px] bg-[#EAF6EA] border border-[#8EB69B]/40 space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#163832] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4F8A6A]" />
                Judge Panel Feedback
              </span>
              <p className="text-sm text-[#051F20] font-medium leading-relaxed italic">
                "{evaluation.feedback}"
              </p>
            </div>

            {/* Actions: Try Again or Next Question */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleTryAgain}
                icon={RotateCcw}
              >
                Try Answering Again
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextQuestion}
                icon={ArrowRight}
              >
                Next Judge Question ({currentIndex + 2 > questions.length ? 'Restart' : `${currentIndex + 2}/${questions.length}`})
              </Button>
            </div>
          </div>
        )}

        {/* ANSWER SUBMISSION FORM (When not in evaluated state) */}
        {!evaluation && (
          <div className="p-6 rounded-[20px] bg-[#0B2B26] border border-[#163832] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="judge-answer" className="text-xs font-bold uppercase tracking-wider text-[#8EB69B]">
                Your Team's Defense
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#71877E]">Rehearsal Helper:</span>
                <button
                  type="button"
                  onClick={handleFillStrong}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-[#163832] text-[#8EB69B] hover:bg-[#8EB69B] hover:text-[#051F20] font-bold transition-colors cursor-pointer"
                >
                  Test Strong Answer
                </button>
                <button
                  type="button"
                  onClick={handleFillWeak}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-[#163832] text-[#C99A3D] hover:bg-[#C99A3D] hover:text-white font-bold transition-colors cursor-pointer"
                >
                  Test Vague Answer
                </button>
              </div>
            </div>

            <textarea
              id="judge-answer"
              rows={5}
              placeholder="State your answer with confidence, mentioning exact metrics, algorithm names, and target user impact..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full text-sm text-white bg-[#051F20] border border-[#163832] rounded-[14px] p-4 focus:outline-none focus:ring-2 focus:ring-[#8EB69B] resize-y placeholder:text-[#71877E]"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#71877E]">
                Tip: Judges award maximum points to answers that quantify the outcome.
              </span>
              <Button
                variant="mint"
                size="md"
                onClick={handleSubmitAnswer}
                loading={evaluating}
                disabled={!answerText.trim()}
                icon={Send}
              >
                Submit Answer to Judges
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeMode;
