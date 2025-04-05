import { PanelLeft, RefreshCw, Bell, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ showSidebar, setShowSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Support Dashboard</h1>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="ml-4 p-2 rounded-md hover:bg-gray-100"
            >
              <PanelLeft className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-md hover:bg-gray-100 flex items-center"
            >
              <RefreshCw className="h-5 w-5 text-gray-500" />
            </button>
            <div className="relative">
              <button className="p-2 rounded-md hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Support Agent</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;