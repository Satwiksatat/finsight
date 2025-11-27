'use client';

import { useRef, useState, type ChangeEvent, type ComponentType, type SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { ClipboardList, LineChart, MessageCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

type ActionId = 'ask-agent' | 'upload-doc' | 'scenario' | 'task';

type Action = {
  id: ActionId;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const actions: Action[] = [
  {
    id: 'ask-agent',
    title: 'Ask CFO Copilot',
    description: 'Jump into chat to brief or query the assistant.',
    icon: MessageCircle,
  },
  {
    id: 'upload-doc',
    title: 'Upload statement',
    description: 'Push PDFs/CSVs into the secured RAG memory fabric.',
    icon: Upload,
  },
  {
    id: 'scenario',
    title: 'Run scenario plan',
    description: 'Open the forecasting lab to stress-test EBITDA & cash.',
    icon: LineChart,
  },
  {
    id: 'task',
    title: 'Task backlog',
    description: 'Review open workstreams and unblock owners.',
    icon: ClipboardList,
  },
];

export function QuickActions() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAction = (id: ActionId) => {
    switch (id) {
      case 'ask-agent':
        router.push('/chat');
        break;
      case 'upload-doc':
        if (!isUploading) {
          fileInputRef.current?.click();
        }
        break;
      case 'scenario':
        router.push('/forecasting');
        break;
      case 'task':
        router.push('/tasks');
        break;
      default:
        break;
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.loading('Uploading document…', { id: 'dashboard-upload' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', DEFAULT_USER_ID);
      formData.append('title', file.name);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Upload failed');
      }

      toast.success(`“${file.name}” queued for ingestion.`, { id: 'dashboard-upload' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed', { id: 'dashboard-upload' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#111A1B] via-[#1A2B31] to-[#111A1B] border border-white/5 p-6 shadow-xl">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
        accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt"
      />
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Command palette</p>
          <h3 className="text-xl font-black text-white">Quick actions</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action.id)}
            disabled={action.id === 'upload-doc' && isUploading}
            className="text-left rounded-2xl bg-white/5 border border-white/10 hover:border-[#53AAA3] disabled:opacity-70 disabled:cursor-not-allowed transition-all p-4 flex gap-3 items-start"
          >
            <span className="p-2 rounded-xl bg-[#0F191B] text-[#53AAA3]">
              <action.icon className="w-4 h-4" />
            </span>
            <span>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                {action.title}
              </p>
              <p className="text-xs text-[#A3CADA]">
                {action.id === 'upload-doc' && isUploading ? 'Encrypting & sending…' : action.description}
              </p>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
