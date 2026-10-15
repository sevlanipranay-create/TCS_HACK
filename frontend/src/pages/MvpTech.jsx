import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import AIRecommendation from '../components/ai/AIRecommendation.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  Layers,
  Cpu,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Scissors,
  ArrowRight,
  ShieldAlert,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MvpTech = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [techStack, setTechStack] = useState(null);
  const [loading, setLoading] = useState(true);

  // New feature inputs
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeaturePriority, setNewFeaturePriority] = useState('must');
  const [newFeatureRole, setNewFeatureRole] = useState('Frontend');
  const [newFeatureHours, setNewFeatureHours] = useState('1.5');

  useEffect(() => {
    api.getMvpAndTech().then((data) => {
      setFeatures(data.features || []);
      setTechStack(data.techStack || null);
      setLoading(false);
    });
  }, []);

  const toggleFeatureCompleted = (id) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
  };

  const removeFeature = (id) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const changePriority = (id, newPriority) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, priority: newPriority } : f))
    );
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    const newF = {
      id: `f-${Date.now()}`,
      name: newFeatureName.trim(),
      priority: newFeaturePriority,
      completed: false,
      estHours: parseFloat(newFeatureHours) || 1.0,
      role: newFeatureRole
    };
    setFeatures((prev) => [...prev, newF]);
    setNewFeatureName('');
  };

  // Anti-Creep Auto-Pruner
  const handleAutoPruneScope = () => {
    setFeatures((prev) =>
      prev.filter((f) => f.priority === 'must')
    );
  };

  // Calculation Stats
  const mustHaveList = features.filter((f) => f.priority === 'must');
  const shouldHaveList = features.filter((f) => f.priority === 'should');
  const niceToHaveList = features.filter((f) => f.priority === 'nice');

  const mustCompleted = mustHaveList.filter((f) => f.completed).length;
  const totalMust = mustHaveList.length;
  const completionPercent = totalMust > 0 ? Math.round((mustCompleted / totalMust) * 100) : 0;

  // Feature creep check: If more than 5 total features or any nice-to-have in a 2-hour sprint
  const isCreepDetected = features.length > 5 || niceToHaveList.length > 0;

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Analyzing MVP Scope & Technology Recommendations..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="03 MVP Builder & Technology Stack"
      subtitle="Define your core demo loop, aggressively eliminate feature creep, and select stack components tailored for speed."
      badge={<Badge variant="mint" size="sm">MoSCoW Scoping</Badge>}
      actions={
        isCreepDetected && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleAutoPruneScope}
            icon={Scissors}
          >
            Auto-Prune to Safe 5-Feature Scope
          </Button>
        )
      }
    >
      {/* Scope Completion Meter Card */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71877E]">
              Core MVP Completion Status
            </span>
            <h3 className="text-xl font-extrabold text-[#051F20] mt-0.5">
              {completionPercent}% Completed ({mustCompleted} / {totalMust} Core Must-Haves Done)
            </h3>
          </div>
          <Badge
            variant={completionPercent >= 80 ? 'success' : completionPercent >= 50 ? 'warning' : 'error'}
            size="md"
          >
            {completionPercent >= 80 ? 'Demo-Ready Pace' : 'Sprint Catchup Required'}
          </Badge>
        </div>

        <ProgressBar
          value={completionPercent}
          variant={completionPercent >= 80 ? 'success' : 'mint'}
          size="lg"
        />

        <p className="text-xs text-[#71877E] mt-3">
          TCS judges score working software exponentially higher than extensive unfinished wireframes. Deliver the core value loop first.
        </p>
      </Card>

      {/* ANTI-FEATURE CREEP ALERT */}
      {isCreepDetected && (
        <AIInsight
          type="warning"
          title="⚠ Anti-Feature Creep Warning: Scope Exceeds 2-Hour Remaining Sprint Time"
        >
          <div className="space-y-2">
            <p className="text-xs text-[#051F20]">
              Your project currently has <strong>{features.length} planned features</strong>. With only ~2 hours remaining before submission, attempting to build nice-to-have items risks breaking your live demo.
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-[#C99A3D]/30 text-xs">
              <strong className="text-[#C99A3D] block mb-1">Recommended Action:</strong>
              <span>
                Prune <em>Multi-Depot Dynamic Fleet Rebalancing</em> and <em>Custom Driver Mobile App</em>. Focus 100% of team effort on the 5 core Must-Haves.
              </span>
            </div>
          </div>
        </AIInsight>
      )}

      {/* Add New Feature Form */}
      <Card variant="white" radius="lg" className="border border-[#DAF1DE]">
        <form onSubmit={handleAddFeature} className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#8EB69B]" /> Add Feature to Scope
            </h4>
            <span className="text-[11px] text-[#71877E]">Every addition must be justified by demo value</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <Input
                label="Feature Description"
                placeholder="e.g. Export route to GeoJSON / PDF"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                label="Priority"
                value={newFeaturePriority}
                onChange={(e) => setNewFeaturePriority(e.target.value)}
                options={[
                  { value: 'must', label: 'MUST HAVE (Core Demo)' },
                  { value: 'should', label: 'SHOULD HAVE (If Time Permits)' },
                  { value: 'nice', label: 'NICE TO HAVE (Post-Hackathon)' }
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                label="Role"
                value={newFeatureRole}
                onChange={(e) => setNewFeatureRole(e.target.value)}
                options={[
                  { value: 'Frontend', label: 'Frontend' },
                  { value: 'Backend', label: 'Backend' },
                  { value: 'AI / Data', label: 'AI / Data' },
                  { value: 'Full Stack', label: 'Full Stack' }
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="mint" size="md" className="w-full" icon={Plus}>
                Add
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* MoSCoW Buckets (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MUST HAVE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#051F20] text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8EB69B]">
              Must Have (Core MVP)
            </span>
            <span className="text-xs font-extrabold bg-[#163832] px-2 py-0.5 rounded text-white">
              {mustHaveList.length}
            </span>
          </div>

          <div className="space-y-2">
            {mustHaveList.map((f) => (
              <Card
                key={f.id}
                variant="white"
                radius="md"
                padding="sm"
                className={`border transition-all ${
                  f.completed ? 'border-[#4F8A6A] bg-[#DAF1DE]/20' : 'border-[#DAF1DE]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => toggleFeatureCompleted(f.id)}
                    className="mt-0.5 text-[#051F20] hover:text-[#4F8A6A] transition-colors"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        f.completed ? 'text-[#4F8A6A] fill-[#DAF1DE]' : 'text-gray-300'
                      }`}
                    />
                  </button>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${f.completed ? 'line-through text-[#71877E]' : 'text-[#051F20]'}`}>
                      {f.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#71877E]">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 font-medium">{f.role}</span>
                      <span>~{f.estHours}h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={f.priority}
                      onChange={(e) => changePriority(f.id, e.target.value)}
                      className="text-[10px] border border-gray-200 rounded p-1 bg-white text-[#051F20]"
                    >
                      <option value="must">Must</option>
                      <option value="should">Should</option>
                      <option value="nice">Nice</option>
                    </select>
                    <button
                      onClick={() => removeFeature(f.id)}
                      className="p-1 text-gray-300 hover:text-[#C75C5C] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* SHOULD HAVE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#163832] text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DAF1DE]">
              Should Have (If Time Permits)
            </span>
            <span className="text-xs font-extrabold bg-[#0B2B26] px-2 py-0.5 rounded text-white">
              {shouldHaveList.length}
            </span>
          </div>

          <div className="space-y-2">
            {shouldHaveList.map((f) => (
              <Card
                key={f.id}
                variant="white"
                radius="md"
                padding="sm"
                className={`border transition-all ${
                  f.completed ? 'border-[#4F8A6A] bg-[#DAF1DE]/20' : 'border-[#DAF1DE]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => toggleFeatureCompleted(f.id)}
                    className="mt-0.5 text-[#051F20] hover:text-[#4F8A6A] transition-colors"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        f.completed ? 'text-[#4F8A6A] fill-[#DAF1DE]' : 'text-gray-300'
                      }`}
                    />
                  </button>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${f.completed ? 'line-through text-[#71877E]' : 'text-[#051F20]'}`}>
                      {f.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#71877E]">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 font-medium">{f.role}</span>
                      <span>~{f.estHours}h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={f.priority}
                      onChange={(e) => changePriority(f.id, e.target.value)}
                      className="text-[10px] border border-gray-200 rounded p-1 bg-white text-[#051F20]"
                    >
                      <option value="must">Must</option>
                      <option value="should">Should</option>
                      <option value="nice">Nice</option>
                    </select>
                    <button
                      onClick={() => removeFeature(f.id)}
                      className="p-1 text-gray-300 hover:text-[#C75C5C] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* NICE TO HAVE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#DAF1DE] text-[#051F20]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#051F20]">
              Nice To Have (Post-Hackathon)
            </span>
            <span className="text-xs font-extrabold bg-white px-2 py-0.5 rounded text-[#051F20]">
              {niceToHaveList.length}
            </span>
          </div>

          <div className="space-y-2">
            {niceToHaveList.map((f) => (
              <Card
                key={f.id}
                variant="white"
                radius="md"
                padding="sm"
                className="border border-[#DAF1DE] opacity-80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#71877E]">
                      {f.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#71877E]">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 font-medium">{f.role}</span>
                      <span>~{f.estHours}h</span>
                      <span className="text-[#C75C5C] font-bold">Cut from Demo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={f.priority}
                      onChange={(e) => changePriority(f.id, e.target.value)}
                      className="text-[10px] border border-gray-200 rounded p-1 bg-white text-[#051F20]"
                    >
                      <option value="must">Must</option>
                      <option value="should">Should</option>
                      <option value="nice">Nice</option>
                    </select>
                    <button
                      onClick={() => removeFeature(f.id)}
                      className="p-1 text-gray-300 hover:text-[#C75C5C] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 16: TECHNOLOGY RECOMMENDATION & COMPLEXITY DEFENSE */}
      <div className="pt-6 border-t border-[#DAF1DE] space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-[#051F20] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#8EB69B]" />
            Technology Recommendations Tailored for NeuroCoders
          </h3>
          <p className="text-xs text-[#71877E] mt-0.5">
            Matched against team skills (React, Python, FastAPI, Postgres) and the 6-hour sprint window.
          </p>
        </div>

        {/* Tech Stack Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techStack?.recommendations?.map((item, idx) => (
            <Card key={idx} variant="white" radius="lg" className="border border-[#8EB69B]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#71877E]">
                  {item.category}
                </span>
                <Badge variant="mint" size="sm">
                  {item.readiness}
                </Badge>
              </div>

              <h4 className="text-base font-bold text-[#051F20]">
                {item.tech}
              </h4>

              <div className="p-2.5 rounded-lg bg-[#EAF6EA]/50 border border-[#DAF1DE] text-xs text-[#49645C]">
                <strong className="text-[#051F20] block mb-0.5">WHY?</strong>
                {item.why}
              </div>
            </Card>
          ))}
        </div>

        {/* AVOID UNNECESSARY COMPLEXITY CALLOUT */}
        <Card variant="white" radius="hero" className="border-2 border-[#C75C5C]/30 p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#C75C5C]">
            <XCircle className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#051F20]">
              Avoid Unnecessary Complexity (Hackathon Traps)
            </h4>
          </div>
          <p className="text-xs text-[#71877E]">
            These architectural decisions waste critical sprint hours with zero judging return:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {techStack?.avoidComplexity?.map((trap, idx) => (
              <div key={idx} className="p-3 rounded-[11px] bg-[#C75C5C]/5 border border-[#C75C5C]/20 text-xs">
                <span className="font-bold text-[#C75C5C] flex items-center gap-1.5 mb-1">
                  ❌ {trap.item}
                </span>
                <span className="text-[#49645C]">{trap.reason}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4 border-t border-[#DAF1DE]">
        <Button
          variant="mint"
          size="md"
          onClick={() => navigate('/workflow')}
          icon={ArrowRight}
        >
          Proceed to 04 Workflow & Time
        </Button>
      </div>
    </PageContainer>
  );
};

export default MvpTech;
