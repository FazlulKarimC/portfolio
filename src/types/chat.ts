export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  canRetry?: boolean;
  originalMessage?: string;
}

export interface ChatState {
  isExpanded: boolean;
  messages: ChatMessage[];
  currentInput: string;
  isLoading: boolean;
  error?: string;
  canRetry?: boolean;
  lastFailedMessage?: string;
  retryCount?: number;
  networkStatus?: 'online' | 'offline' | 'slow';
}

export interface AIChatComponentProps {
  className?: string;
  defaultExpanded?: boolean;
}

// AI Context interfaces for roleplay functionality
export interface AIContext {
  name: string;
  role: string;
  location: string;
  experience: string;
  skills: string[];
  projects: ProjectContext[];
  education: EducationContext[];
  contact: ContactContext;
  personality: string;
  summary: string;
}

export interface ProjectContext {
  name: string;
  description: string;
  technologies: string[];
  status: string;
  dates: string;
  links?: {
    website?: string;
    source?: string;
  };
}

export interface EducationContext {
  institution: string;
  degree: string;
  period: string;
  description?: string;
}

export interface WorkContext {
  company: string;
  title: string;
  location: string;
  period: string;
  description: string;
}

export interface ContactContext {
  email: string;
  phone: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}