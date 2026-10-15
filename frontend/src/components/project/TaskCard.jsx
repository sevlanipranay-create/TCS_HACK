import Card from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import { CheckCircle2, User } from 'lucide-react';

export const TaskCard = ({
  task,
  onStatusChange,
  className = ''
}) => {
  if (!task) return null;

  const isDone = task.column === 'done';

  return (
    <Card
      variant="white"
      radius="md"
      padding="sm"
      className={`border border-[#DAF1DE] hover:border-[#8EB69B] transition-all shadow-2xs ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {task.tag && (
            <Badge variant="mint" size="sm">
              {task.tag}
            </Badge>
          )}
          {task.priority && (
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              task.priority === 'must' ? 'bg-[#C75C5C]/15 text-[#C75C5C]' :
              task.priority === 'should' ? 'bg-[#C99A3D]/15 text-[#C99A3D]' :
              'bg-gray-100 text-[#71877E]'
            }`}>
              {task.priority}
            </span>
          )}
        </div>

        <p className="text-xs md:text-sm font-semibold text-[#051F20] leading-snug">
          {task.title || task.name}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#DAF1DE]/60 text-xs text-[#71877E]">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#DAF1DE] text-[#051F20] flex items-center justify-center text-[10px] font-bold">
              {task.assignee ? task.assignee.split(' ').map(n=>n[0]).join('') : <User className="w-3 h-3" />}
            </div>
            <span className="text-[11px] truncate max-w-[100px]">{task.assignee || task.role || 'Team'}</span>
          </div>

          {onStatusChange && (
            <button
              onClick={() => onStatusChange(task.id, isDone ? 'todo' : 'done')}
              className={`p-1 rounded transition-colors ${isDone ? 'text-[#4F8A6A]' : 'text-gray-300 hover:text-[#4F8A6A]'}`}
              title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
