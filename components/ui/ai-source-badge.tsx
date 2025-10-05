import { Badge } from './badge';
import { Zap, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AISourceBadgeProps {
  source: 'chrome' | 'cloud' | 'hybrid';
  provider?: string;
  className?: string;
  showIcon?: boolean;
}

export function AISourceBadge({ source, provider, className, showIcon = true }: AISourceBadgeProps) {
  const configs = {
    chrome: {
      label: 'Chrome AI',
      icon: Zap,
      variant: 'default' as const,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    cloud: {
      label: provider || 'Cloud AI',
      icon: Cloud,
      variant: 'secondary' as const,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    hybrid: {
      label: 'Hybrid AI',
      icon: Zap,
      variant: 'outline' as const,
      iconColor: 'text-primary',
      bgColor: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-primary/20',
    },
  };

  const config = configs[source];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn(config.bgColor, className)}>
      {showIcon && <Icon className={cn('h-3 w-3 mr-1', config.iconColor)} />}
      {config.label}
    </Badge>
  );
}

export function AIProcessingTime({
  chromeMs,
  cloudMs,
  total
}: {
  chromeMs?: number;
  cloudMs?: number;
  total?: number;
}) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {chromeMs !== undefined && chromeMs > 0 && (
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-blue-500" />
          <span>Chrome: {chromeMs}ms</span>
        </div>
      )}
      {cloudMs !== undefined && cloudMs > 0 && (
        <div className="flex items-center gap-1">
          <Cloud className="h-3 w-3 text-purple-500" />
          <span>Cloud: {cloudMs}ms</span>
        </div>
      )}
      {total !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-medium">Total: {total}ms</span>
        </div>
      )}
    </div>
  );
}
