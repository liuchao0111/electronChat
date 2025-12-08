export interface ConversationProps {
  id: number;
  title: string;
  selectedModel: string;
  createdAt: string;
  updatedAt: string;
  providerId: number;
}

export interface ProviderProps {
  id: number;
  name: string;
  title?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  desc?: string;
  models: string[];
}

export type MessageStatus = "loading" | "streaming" | "finished";

export interface MessageProps {
  id: number;
  conversationId: number;
  type: "question" | "answer";
  content: string;
  status?: MessageStatus;
  createdAt: string;
  updatedAt: string;
  imagePath?: string;
}

export type ButtonColor = "green" | "purple";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  iconName?: string;
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  plain?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface ChatMessageProps {
  role: string;
  content: string;
  imagePath?: string;
}

export interface CreateChatProps {
  messages: { role: string; content: string; imagePath?: string }[];
  providerName: string;
  selectedModel: string;
  messageId: number;
}

export interface UpdatedStreamProps {
  messageId: number;
  data: {
    is_end: boolean;
    result: string;
  };
}

export type onUpdateMessageCallback = (data: UpdatedStreamProps) => void;

export interface UniversalChunkProps {
  is_end: boolean;
  result: string;
}


export interface BaiduChunkProps {
  is_end: boolean;
  result: string;
}
