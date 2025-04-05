import { User, Filter } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { SupportTicket } from '../../types/SupportTicket';

interface TicketListProps {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  setSelectedTicket: (ticket: SupportTicket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, selectedTicket, setSelectedTicket }) => {


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`${selectedTicket ? 'hidden md:block' : 'block'} w-full border-r border-gray-200 bg-white overflow-y-auto`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Support Tickets</h2>
        <button className="p-1 rounded-md hover:bg-gray-100">
          <Filter className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <li 
              key={ticket.ticket_id} 
              className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedTicket?.ticket_id === ticket.ticket_id ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {ticket?.user?.avatar ? (
                      <img src={ticket.user.avatar} alt={ticket.user.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500 m-auto" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{ticket?.user?.full_name}</p>
                    <p className="text-xs text-gray-500">{ticket?.ticket_id} · {new Date(ticket?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket?.status)}`}>
                  {ticket?.status?.charAt(0).toUpperCase() + ticket?.status?.slice(1)}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 truncate">{ticket.title}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
            </li>
          ))
        ) : (
          <li className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">No tickets found</p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default TicketList;