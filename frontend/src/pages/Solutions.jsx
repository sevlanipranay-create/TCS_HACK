import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import AIRecommendation from '../components/ai/AIRecommendation.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Solutions = () => {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState('sol-A');
  const [showComparison, setShowComparison] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSolutions().then((data) => {
      setSolutions(data.solutions || []);
      setRecommendation(data.recommendation || null);
      if (data.recommendation?.selectedSolutionId) {
        setSelectedSolutionId(data.recommendation.selectedSolutionId);
      }
      setLoading(false);
    });
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-[#C99A3D]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'fill-current' : 'text-gray-200 stroke-gray-300'
            }`}
          />
        ))}
        <span className="ml-1.5 text-xs font-bold text-[#051F20]">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Generating & Evaluating Solution Architectures..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="02 Solution Lab"
      subtitle="Compare candidate architectural approaches, weigh feasibility tradeoffs, and lock in the winning solution."
      badge={<Badge variant="mint" size="sm">Architecture Stage</Badge>}
      actions={
        <Button
          variant={showComparison ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowComparison(!showComparison)}
          icon={Scale}
        >
          {showComparison ? 'Hide Comparison Matrix' : 'Show Comparison Matrix'}
        </Button>
      }
    >
      {/* AI Mentor Recommendation Callout */}
      {recommendation && (
        <AIRecommendation
          title={recommendation.title}
          description={recommendation.recommendationText}
          actionText="Lock In Solution A"
          onAction={() => {
            setSelectedSolutionId('sol-A');
            navigate('/mvp-tech');
          }}
          factors={recommendation.breakdown}
        />
      )}

      {/* Comparison Matrix Table */}
      {showComparison && (
        <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DAF1DE]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#8EB69B]" />
              Architectural Tradeoff Matrix
            </h3>
            <span className="text-xs text-[#71877E]">Weighted by 6-Hour Hackathon Constraints</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DAF1DE] bg-[#EAF6EA]/40">
                  <th className="py-3 px-4 font-bold text-[#051F20]">Evaluation Metric</th>
                  {solutions.map((sol) => (
                    <th
                      key={sol.id}
                      className={`py-3 px-4 font-bold ${
                        selectedSolutionId === sol.id ? 'text-[#051F20] bg-[#DAF1DE]/70' : 'text-[#49645C]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{sol.name.split(' ')[0]}</span>
                        {selectedSolutionId === sol.id && (
                          <Badge variant="mint" size="sm">Selected</Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DAF1DE]/60">
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#051F20]">Impact on Problem</td>
                  {solutions.map((sol) => (
                    <td key={sol.id} className={`py-3 px-4 ${selectedSolutionId === sol.id ? 'bg-[#DAF1DE]/30 font-bold' : ''}`}>
                      {sol.impact}/5
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#051F20]">Algorithmic Innovation</td>
                  {solutions.map((sol) => (
                    <td key={sol.id} className={`py-3 px-4 ${selectedSolutionId === sol.id ? 'bg-[#DAF1DE]/30 font-bold' : ''}`}>
                      {sol.innovation}/5
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#051F20]">Feasibility (6h Timeframe)</td>
                  {solutions.map((sol) => (
                    <td key={sol.id} className={`py-3 px-4 ${selectedSolutionId === sol.id ? 'bg-[#DAF1DE]/30 font-bold' : ''}`}>
                      <span className={sol.feasibility >= 4 ? 'text-[#4F8A6A] font-bold' : 'text-[#C75C5C]'}>
                        {sol.feasibility}/5
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#051F20]">Technical Complexity</td>
                  {solutions.map((sol) => (
                    <td key={sol.id} className={`py-3 px-4 ${selectedSolutionId === sol.id ? 'bg-[#DAF1DE]/30 font-bold' : ''}`}>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        sol.complexity === 'Low' ? 'bg-[#4F8A6A]/15 text-[#4F8A6A]' :
                        sol.complexity === 'Medium' ? 'bg-[#C99A3D]/15 text-[#C99A3D]' :
                        'bg-[#C75C5C]/15 text-[#C75C5C]'
                      }`}>
                        {sol.complexity}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-[#051F20]">Est. Dev Time</td>
                  {solutions.map((sol) => (
                    <td key={sol.id} className={`py-3 px-4 ${selectedSolutionId === sol.id ? 'bg-[#DAF1DE]/30 font-bold' : ''}`}>
                      {sol.developmentTimeHours} hours
                    </td>
                  ))}
                </tr>
                <tr className="bg-[#EAF6EA]/70">
                  <td className="py-3 px-4 font-extrabold text-[#051F20]">Overall Composite Score</td>
                  {solutions.map((sol) => (
                    <td key={sol.id} className={`py-3 px-4 text-sm font-black ${
                      sol.score >= 4.5 ? 'text-[#4F8A6A]' : sol.score >= 3.5 ? 'text-[#C99A3D]' : 'text-[#C75C5C]'
                    }`}>
                      {sol.score} / 5.0
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Solution Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {solutions.map((sol, index) => {
          const isSelected = selectedSolutionId === sol.id;
          const letter = String.fromCharCode(65 + index);

          return (
            <Card
              key={sol.id}
              variant="white"
              radius="lg"
              className={`flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-[#8EB69B] shadow-md ring-2 ring-[#8EB69B]/20'
                  : 'border border-[#DAF1DE] hover:border-[#8EB69B]/40'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#051F20] text-[#8EB69B] flex items-center justify-center font-bold text-xs">
                      {letter}
                    </span>
                    <Badge variant={isSelected ? 'mint' : 'neutral'} size="sm">
                      Solution {letter}
                    </Badge>
                  </div>
                  <span className="text-sm font-black text-[#051F20]">
                    Score: {sol.score}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#051F20] leading-snug">
                    {sol.name}
                  </h3>
                  <p className="text-xs text-[#49645C] mt-1.5 leading-relaxed">
                    {sol.shortDescription}
                  </p>
                </div>

                {/* Rating Rows */}
                <div className="space-y-2 py-2 border-y border-[#DAF1DE] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877E]">Impact:</span>
                    {renderStars(sol.impact)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877E]">Innovation:</span>
                    {renderStars(sol.innovation)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877E]">Feasibility:</span>
                    {renderStars(sol.feasibility)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877E]">Complexity:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      sol.complexity === 'Low' ? 'bg-[#4F8A6A]/15 text-[#4F8A6A]' :
                      sol.complexity === 'Medium' ? 'bg-[#C99A3D]/15 text-[#C99A3D]' :
                      'bg-[#C75C5C]/15 text-[#C75C5C]'
                    }`}>
                      {sol.complexity}
                    </span>
                  </div>
                </div>

                {/* Advantages */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F8A6A] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Advantages
                  </span>
                  <ul className="space-y-1 text-xs text-[#051F20]">
                    {sol.advantages?.map((adv, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#4F8A6A] font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C75C5C] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risks & Bottlenecks
                  </span>
                  <ul className="space-y-1 text-xs text-[#71877E]">
                    {sol.risks?.map((risk, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C75C5C]">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-[#DAF1DE]">
                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedSolutionId(sol.id)}
                >
                  {isSelected ? '✓ Selected Architecture' : `Select Solution ${letter}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Next Step Action Button */}
      <div className="flex items-center justify-between pt-4 border-t border-[#DAF1DE]">
        <div className="text-xs text-[#71877E]">
          Selected: <strong className="text-[#051F20]">{solutions.find(s=>s.id === selectedSolutionId)?.name}</strong>
        </div>
        <Button
          variant="mint"
          size="md"
          onClick={() => navigate('/mvp-tech')}
          icon={ArrowRight}
        >
          Proceed to 03 MVP & Tech
        </Button>
      </div>
    </PageContainer>
  );
};

export default Solutions;
