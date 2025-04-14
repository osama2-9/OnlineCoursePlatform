import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  PaperclipIcon,
  Clock,
  AlertCircle,
  Loader,
  ArrowLeft,
  Headphones,
  Calendar,
  Check,
} from "lucide-react";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import useSocket from "../../socketIo/useSocket";

interface SupportTicket {
  ticket_id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  created_at: string;
  supportUser: {
    fullname: string;
    supportUserId: number;
  };
  messages: Message[];
}

interface Message {
  message_id: number;
  message: string;
  user_id: number;
  ticket_id: number;
  sent_at: Date;
}

const UsersChatPage = () => {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [supportTicket, setSupportTicket] = useState<SupportTicket | null>(
    null
  );
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("access_token");

  const verifyAccessToken = async () => {
    try {
      if (!token) {
        toast.error("No access token found in URL");
        setIsLoading(false);
        return;
      }

      const res = await axios.get(`${API}/support/verify-access-token`, {
        params: {
          token: token,
          userId: user?.userId,
        },
      });

      if (res.data.isValid) {
        setIsAuthenticated(true);
        setTicketId(res.data.ticketId);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error?.response?.data?.error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketData = async () => {
    if (!ticketId) {
      return;
    }

    try {
      const res = await axios.get(`${API}/support/get-ticket`, {
        params: {
          ticketId: ticketId,
        },
      });

      if (res.data) {
        setSupportTicket(res.data.ticket);

        if (
          res.data.SupportTicketMessage &&
          Array.isArray(res.data.SupportTicketMessage)
        ) {
        }
      }
    } catch (error: any) {
      console.error("Error loading ticket data:", error);
      toast.error(error.response?.data?.error || "Failed to load ticket data");
    }
  };

  const handleNewMessage = (data: any) => {
    console.log(data);

    if (data.ticket_id === ticketId) {
      setSupportTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, data],
        };
      });
    }
  };

  const handleNewStatus = (data: any) => {
    if (data.ticket_id == supportTicket?.ticket_id) {
      console.log(data);

      setSupportTicket((prev: any) => ({
        ...prev,
        status: "closed",
      }));
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", handleNewMessage);
      socket.on("newstatus", handleNewStatus);
    }

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
      }
    };
  }, [socket, ticketId]);

  useEffect(() => {
    if (ticketId) {
      loadTicketData();
    }
  }, [ticketId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    verifyAccessToken();
  }, [token, user?.userId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ticketId) return;

    if (!isAuthenticated) {
      toast.error("You are not authenticated");
      return;
    }

    setMessage("");

    try {
      const response = await axios.post(`${API}/support/send-message`, {
        ticket_id: ticketId,
        user_id: user?.userId,
        message: message,
      });
      if (response) {
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      setMessage(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-600">Verifying your access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Invalid or expired access token. Please use the link provided in
            your email to access this support chat.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!supportTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading ticket information...</p>
        </div>
      </div>
    );
  }

  if (supportTicket.status === "closed") {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
            <Check color="white" size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your ticket has been resolved!
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              We're glad we could help you. If you have any further questions,
              please don't hesitate to reach out.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-6">
        <a
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </a>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Support Ticket #{supportTicket.ticket_id}
                </h1>
                <h2 className="text-lg font-medium text-gray-700 mt-1">
                  {supportTicket.title}
                </h2>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {supportTicket.status === "open" && "Open"}
                {supportTicket.status === "in_progress" && "In Progress"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>
                  Created:{" "}
                  {new Date(supportTicket.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Headphones size={16} className="mr-2" />
                <span>
                  Agent: {supportTicket.supportUser.fullname || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500 mb-1">
                Original description:
              </div>
              <p className="text-gray-700">{supportTicket.description}</p>
            </div>
          </div>

          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {supportTicket?.messages?.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`flex ${
                    msg.user_id == user?.userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                      msg.user_id == user?.userId
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <div className="text-sm mb-1 flex items-center">
                      {msg.user_id == user?.userId
                        ? "You"
                        : supportTicket.supportUser.fullname}
                      <span className="text-xs mx-2 opacity-75">•</span>
                      <span className="text-xs opacity-75">
                        {new Date(msg.sent_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            <div className="border-t p-4">
              <form
                onSubmit={sendMessage}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-blue-600"
                >
                  <PaperclipIcon size={20} />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className={` text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <Clock size={16} className="inline mr-1" />
          Our support team typically responds within 24 hours.
        </div>
      </div>
    </div>
  );
};

export default UsersChatPage;
