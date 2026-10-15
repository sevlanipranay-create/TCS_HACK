import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import TaskCard from '../components/project/TaskCard.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  KanbanSquare,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Progress = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [health, setHealth] = useState('At Risk');
  const [healthReason, setHealthReason] = useState('');
  const [loading, setLoading] = useState(true);

  // New task inline modal/form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Rohan Verma');
  const [newTaskTag, setNewTaskTag] = useState('Frontend');
  const [newTaskColumn, setNewTaskColumn] = useState('todo');

  useEffect(() => {
    api.getProgress().then((data) => {
      setTasks(data.tasks || []);
      setHealth(data.projectHealth || 'At Risk');
      setHealthReason(data.healthReason || '');
      setLoading(false);
    });
  }, []);

  const handleMoveTask = (taskId, targetColumn) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column: targetColumn } : t))
    );
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee,
      tag: newTaskTag,
      column: newTaskColumn
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  // Dynamic progress computation
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.column === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.column === 'in_progress').length;
  const dynamicProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const todoList = tasks.filter((t) => t.column === 'todo');
  const inProgressList = tasks.filter((t) => t.column === 'in_progress');
  const doneList = tasks.filter((t) => t.column === 'done');

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Syncing Sprint Kanban Board..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="05 Project Progress & Sprint Kanban"
      subtitle="Track active development tasks, unblock team bottlenecks, and keep the sprint velocity transparent."
      badge={
        <Badge variant={health === 'Good' ? 'success' : 'warning'} size="sm">
          Project Health: {health}
        </Badge>
      }
      actions={
        <Button
          variant="mint"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          icon={Plus}
        >
          {showAddForm ? 'Cancel' : 'New Sprint Task'}
        </Button>
      }
    >
      {/* Progress Overview Hero Card */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71877E]">
              Sprint Execution Progress
            </span>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-black text-[#051F20]">
                {dynamicProgress}%
              </h3>
              <span className="text-sm font-semibold text-[#49645C]">
                ({doneTasks} Completed / {inProgressTasks} In Progress / {todoList.length} Todo)
              </span>
            </div>
            <p className="text-xs text-[#71877E] leading-relaxed">
              {healthReason || 'Sprint pace is steady. Ensure validation items are not postponed past 02:30.'}
            </p>
          </div>

          <div className="lg:w-80 space-y-2 bg-[#EAF6EA]/50 p-4 rounded-[16px] border border-[#DAF1DE]">
            <div className="flex justify-between items-center text-xs font-bold text-[#051F20]">
              <span>Project Health</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${
                health === 'Good' ? 'bg-[#4F8A6A]/15 text-[#4F8A6A]' :
                health === 'Critical' ? 'bg-[#C75C5C]/15 text-[#C75C5C]' :
                'bg-[#C99A3D]/15 text-[#C99A3D]'
              }`}>
                {health}
              </span>
            </div>
            <ProgressBar
              value={dynamicProgress}
              variant={dynamicProgress >= 75 ? 'success' : 'mint'}
              size="md"
            />
            <div className="flex justify-between text-[11px] text-[#71877E] pt-1">
              <span>Goal: 90%+ by Demo Freeze</span>
              <span className="font-semibold text-[#051F20]">Target Met</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Task Quick Form */}
      {showAddForm && (
        <Card variant="mintLight" radius="lg" className="border border-[#8EB69B] p-4 animate-fadeIn">
          <form onSubmit={handleAddTask} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20]">
              Create New Sprint Task
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <Input
                  label="Task Title"
                  placeholder="e.g. Test route caching on slow 3G simulation"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Assignee"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Tag"
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Create Task
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Kanban Board Grid (TODO, IN PROGRESS, DONE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODO Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#DAF1DE] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C99A3D]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20]">
                To Do
              </h4>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-[#051F20]">
              {todoList.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[200px] p-2 rounded-[14px] bg-[#EAF6EA]/30 border border-[#DAF1DE]/60">
            {todoList.map((task) => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} />
                <div className="mt-1 flex justify-end gap-1.5 opacity-90">
                  <button
                    onClick={() => handleMoveTask(task.id, 'in_progress')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#051F20] text-white hover:bg-[#163832]"
                  >
                    Start →
                  </button>
                </div>
              </div>
            ))}
            {todoList.length === 0 && (
              <p className="text-center text-xs text-[#71877E] py-8">No tasks in To Do</p>
            )}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#5C8AC7]/30 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5C8AC7] animate-ping" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20]">
                In Progress
              </h4>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#5C8AC7]/15 text-[#5C8AC7]">
              {inProgressList.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[200px] p-2 rounded-[14px] bg-[#EAF6EA]/30 border border-[#DAF1DE]/60">
            {inProgressList.map((task) => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} />
                <div className="mt-1 flex justify-between gap-1.5 opacity-90 text-[10px]">
                  <button
                    onClick={() => handleMoveTask(task.id, 'todo')}
                    className="text-[#71877E] hover:underline"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleMoveTask(task.id, 'done')}
                    className="font-bold px-2 py-0.5 rounded bg-[#4F8A6A] text-white hover:bg-[#3d7055]"
                  >
                    Mark Done ✓
                  </button>
                </div>
              </div>
            ))}
            {inProgressList.length === 0 && (
              <p className="text-center text-xs text-[#71877E] py-8">No active tasks</p>
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#4F8A6A]/30 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F8A6A]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20]">
                Done & Verified
              </h4>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#4F8A6A]/15 text-[#4F8A6A]">
              {doneList.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[200px] p-2 rounded-[14px] bg-[#EAF6EA]/30 border border-[#DAF1DE]/60">
            {doneList.map((task) => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} />
                <div className="mt-1 flex justify-end gap-1.5 opacity-90 text-[10px]">
                  <button
                    onClick={() => handleMoveTask(task.id, 'in_progress')}
                    className="text-[#71877E] hover:underline"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}
            {doneList.length === 0 && (
              <p className="text-center text-xs text-[#71877E] py-8">No completed tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4 border-t border-[#DAF1DE]">
        <Button
          variant="mint"
          size="md"
          onClick={() => navigate('/mentor')}
          icon={ArrowRight}
        >
          Proceed to AI Mentor Workspace
        </Button>
      </div>
    </PageContainer>
  );
};

export default Progress;
