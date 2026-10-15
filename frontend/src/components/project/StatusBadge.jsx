import React from 'react';
import Badge from '../common/Badge.jsx';
import { CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';

export const StatusBadge = ({
  status = 'pending', // 'completed' | 'in_progress' | 'pending' | 'blocked' | 'at_risk'
  className = ''
}) => {
  const normalized = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  switch (normalized) {
    case 'completed':
    case 'done':
    case 'optimal':
    case 'exceptional':
      return (
        <Badge variant="success" size="sm" icon={CheckCircle2} className={className}>
          {status}
        </Badge>
      );
    case 'in_progress':
    case 'in_review':
    case 'running':
      return (
        <Badge variant="info" size="sm" icon={Clock} className={className}>
          {status}
        </Badge>
      );
    case 'at_risk':
    case 'warning':
    case 'needs_action':
      return (
        <Badge variant="warning" size="sm" icon={AlertTriangle} className={className}>
          {status}
        </Badge>
      );
    case 'blocked':
    case 'critical':
    case 'failed':
      return (
        <Badge variant="error" size="sm" icon={XCircle} className={className}>
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size="sm" className={className}>
          {status}
        </Badge>
      );
  }
};

export default StatusBadge;
