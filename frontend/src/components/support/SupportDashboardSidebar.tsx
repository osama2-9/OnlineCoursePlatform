import { MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { SupportTicket } from '../../types/SupportTicket';

interface SidebarProps {
  tickets: SupportTicket[];
}

const SupportDashboardSidebar: React.FC<SidebarProps> = ({ tickets }) => {
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const inProgressTicketsCount = tickets.filter(t => t.status === 'in_progress').length;
  const closedTicketsCount = tickets.filter(t => t.status === 'closed').length;

  return (
    <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overview</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Open</p>
                    <p className="text-lg font-semibold text-gray-900">{openTicketsCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-md bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-lg font-semibold text-gray-900">{inProgressTicketsCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Closed</p>
                    <p className="text-lg font-semibold text-gray-900">{closedTicketsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default SupportDashboardSidebar;