import Card from '../common/Card.jsx';

export const TeamMemberCard = ({
  member,
  className = ''
}) => {
  if (!member) return null;

  return (
    <Card
      variant="white"
      radius="md"
      padding="sm"
      className={`border border-[#DAF1DE] hover:border-[#8EB69B]/40 transition-colors ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#051F20] text-[#8EB69B] flex items-center justify-center font-bold text-sm shrink-0">
          {member.avatar || member.name.split(' ').map(n=>n[0]).join('')}
        </div>
        <div className="space-y-1 overflow-hidden flex-1">
          <h4 className="text-sm font-bold text-[#051F20] truncate">{member.name}</h4>
          <p className="text-xs text-[#49645C] font-medium truncate">{member.role}</p>

          {member.skills && member.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1.5">
              {member.skills.slice(0, 3).map((s, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#DAF1DE]/80 text-[#051F20] font-medium"
                >
                  {s}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="text-[10px] px-1 py-0.5 text-[#71877E]">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TeamMemberCard;
