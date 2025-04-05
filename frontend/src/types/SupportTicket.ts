interface SupportTicketMessage {
  message_id: number;
  message: string;
  sent_at: string;
  sender: 'user' | 'support'; // Add this field
  user_id: number;
  ticket_id: number;
}

interface SupportTicket {
  ticket_id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
  user: {
    user_id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  messages: SupportTicketMessage[];
}

export type { SupportTicket, SupportTicketMessage };