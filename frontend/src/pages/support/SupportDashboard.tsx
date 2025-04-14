import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  User,
  MoreHorizontal,
  Send,
  Mail,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import Header from "../../components/support/Header";
import SupportDashboardSidebar from "../../components/support/SupportDashboardSidebar";
import TicketList from "../../components/support/TicketList";
import { SupportTicket } from "../../types/SupportTicket";
import useSocket from "../../socketIo/useSocket";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const SupportDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCloseing, setIsCloseing] = useState<boolean>(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket } = useSocket();

  const sentMessagesRef = useRef(new Set<string>());

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      const messageSignature = `${data.user_id}-${data.message}-${data.ticket_id}`;

      if (sentMessagesRef.current.has(messageSignature)) {
        sentMessagesRef.current.delete(messageSignature);
        return;
      }

      if (data.ticket_id === selectedTicket?.ticket_id) {
        setSelectedTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                ...data,
                sender: data.user_id === prev.user.user_id ? "user" : "support",
              },
            ],
          };
        });
      }
    };

    const handleNewSupportTicket = (data: any) => {
      setTickets((prev) => [...prev, data]);
    };

    const handleNewStatus = (data: any) => {
      if (data && data.ticket_id == selectedTicket?.ticket_id) {
        setSelectedTicket((prev: any) => ({
          ...prev,
          status: "closed",
        }));
      }
    };
    socket?.on("newMessage", handleNewMessage);
    socket?.on("newSupportTicket", handleNewSupportTicket);
    socket?.on("newstatus", handleNewStatus);
    return () => {
      socket?.off("newMessage", handleNewMessage);
      socket?.off("newSupportTicket", handleNewSupportTicket);
    };
  }, [socket, selectedTicket?.ticket_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const handleSendChatLink = () => {
    if (!selectedTicket) return;
    alert(`Chat link sent to ${selectedTicket.user.email}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGetTickets = async () => {
    try {
      const res = await axios.get(`${API}/support/get-support-tickets`, {
        params: {
          page: 1,
          limit: 5,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!replyMessage.trim() || !selectedTicket || !user?.userId) return;

      setIsSending(true);
      setSendError("");

      const messageToSend = replyMessage.trim();

      const messageSignature = `${user.userId}-${messageToSend}-${selectedTicket.ticket_id}`;

      sentMessagesRef.current.add(messageSignature);

      setSelectedTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              message_id: Date.now(),
              message: messageToSend,
              sent_at: new Date().toISOString(),
              user_id: user.userId,
              ticket_id: selectedTicket.ticket_id,
              sender: "support",
            },
          ],
        };
      });

      setReplyMessage("");

      await axios.post(
        `${API}/support/send-message`,
        {
          ticket_id: selectedTicket.ticket_id,
          message: messageToSend,
          user_id: user.userId,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setSendError("Failed to send message. Please try again.");
      setReplyMessage(replyMessage);
      setTimeout(() => setSendError(""), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: handleGetTickets,
    initialData: [],
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setTickets(data);
    }
  }, [data]);

  const handleChangeTicketStatus = async () => {
    try {
      setIsCloseing(true);
      const res = await axios.put(
        `${API}/support/change-ticket-status`,
        {
          userId: user?.userId,
          status: "closed",
        },
        {
          params: {
            ticketId: selectedTicket?.ticket_id,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        toast.success(data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Internal server error");
    } finally {
      setIsCloseing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {showSidebar && <SupportDashboardSidebar tickets={tickets} />}

        <div className="flex-1 flex overflow-hidden">
          <div
            className={`${
              selectedTicket ? "hidden md:block" : "block"
            } w-full md:w-1/3 border-r border-gray-200 bg-white overflow-y-auto`}
          >
            {isLoading ? (
              <></>
            ) : (
              <>
                <TicketList
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  setSelectedTicket={setSelectedTicket}
                />
              </>
            )}
          </div>

          {selectedTicket ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedTicket.title}
                      </h2>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedTicket.status
                        )}`}
                      >
                        {selectedTicket?.status?.charAt(0)?.toUpperCase() +
                          selectedTicket?.status?.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>{selectedTicket.ticket_id}</span>
                      <span className="mx-1">·</span>
                      <span>
                        Created {formatDate(selectedTicket.created_at)}
                      </span>
                      <span className="mx-1">·</span>
                      <span>
                        Last updated {formatTime(selectedTicket.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      disabled={selectedTicket.status === "closed"}
                      onClick={handleChangeTicketStatus}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {isCloseing ? (
                        <Loader2
                          className="animate-spin"
                          color="white"
                          size={15}
                        />
                      ) : (
                        "Close"
                      )}
                    </button>
                    <button className="p-1 rounded-md hover:bg-gray-100">
                      <MoreHorizontal className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      {selectedTicket.user.avatar ? (
                        <img
                          src={selectedTicket.user.avatar}
                          alt={selectedTicket.user.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500 m-auto" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTicket.user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedTicket.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSendChatLink}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Send Chat Link
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="ml-2">{selectedTicket.title}</span>
                  </div>
                </div>
              </div>
              {selectedTicket.status == "closed" ? (
                <>
                  <div className="w-full p-2  rounded-md shadow-md">
                    <div className="flex flex-col text-center justify-center">
                      <p className="text-gray-900 text-sm font-semibold ">
                        Ticket With Id #{selectedTicket.ticket_id} Closed !
                      </p>

                      <p className="text-sm mt-2 text-gray-600">
                        Thank you for helping
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-4">
                      {selectedTicket.messages.map((message, index) => (
                        <div
                          key={`${message.message_id}-${index}`}
                          className={`flex ${
                            message.sender === "user"
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-3/4 rounded-lg px-4 py-2 ${
                              message.sender === "user"
                                ? "bg-white border border-gray-200"
                                : "bg-blue-100 border border-blue-200"
                            }`}
                          >
                            <div className="text-sm text-gray-800">
                              {message.message}
                            </div>
                            <div
                              className={`mt-1 text-xs ${
                                message.sender === "user"
                                  ? "text-gray-500"
                                  : "text-blue-600"
                              }`}
                            >
                              {formatTime(message.sent_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500 shadow-sm ">
                          <label htmlFor="reply" className="sr-only">
                            Reply
                          </label>
                          <textarea
                            rows={3}
                            name="reply"
                            id="reply"
                            className="block w-full py-3 px-4 resize-none border-0 focus:ring-0 sm:text-sm"
                            placeholder="Write a reply..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            disabled={isSending}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                            {sendError && (
                              <div className="text-red-500 text-sm">
                                {sendError}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleSendMessage}
                              disabled={!replyMessage.trim() || isSending}
                              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                replyMessage.trim() && !isSending
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-blue-300 cursor-not-allowed"
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                              {isSending ? (
                                "Sending..."
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No ticket selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a ticket from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
