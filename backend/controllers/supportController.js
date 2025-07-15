import { prisma } from "../prisma/prismaClint.js";
import { io } from "../index.js";
import { generateChatAccessToken } from "../utils/generateChatAccessToken.js";
import { sendChatLink } from "../emails/sendChatLink.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const findAndAssignSupportTicket = async (ticket_id) => {
  const supportUsers = await prisma.users.findMany({
    where: {
      role: "support",
      is_active: true,
    },
  });

  if (supportUsers.length === 0) {
    return null;
  }

  const supportUsersWorkLoad = await Promise.all(
    supportUsers.map(async (user) => {
      const activeTickets = await prisma.supportTicket.count({
        where: {
          assign_to: user.user_id,
          status: {
            in: ["open", "in_progress"],
          },
        },
      });

      return {
        supportUserId: user.user_id,
        workload: activeTickets,
      };
    })
  );

  const sortedSupportUsers = supportUsersWorkLoad.sort(
    (a, b) => a.workload - b.workload
  );

  const assignedUser = sortedSupportUsers[0];

  await prisma.supportTicket.update({
    where: { ticket_id },
    data: { assign_to: assignedUser.supportUserId },
  });

  const ticket = await prisma.supportTicket.findUnique({
    where: { ticket_id },
    select: {
      ticket_id: true,
      title: true,
      description: true,
      status: true,
      created_at: true,
      updated_at: true,
      assign_to: true,
      user: {
        select: {
          user_id: true,
          full_name: true,
          email: true,
        },
      },
      SupportTicketMessage: {
        select: {
          message_id: true,
          user_id: true,
          message: true,
          is_read: true,
          created_at: true,
        },
      },
    },
  });

  if (!ticket) return null;

  const formattedTicket = {
    ticket_id: ticket.ticket_id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    created_at: ticket.created_at.toISOString(),
    updated_at: ticket.updated_at.toISOString(),
    user: ticket.user,
    messages: ticket.SupportTicketMessage.map((message) => ({
      message_id: message.message_id,
      sender: message.user_id === ticket.user.user_id ? "user" : "support",
      message: message.message,
      sent_at: message.created_at.toISOString(),
      is_read: message.is_read,
    })),
  };

  return formattedTicket;
};
export const createSupportTicket = async (req, res) => {
  try {
    const { message, selectedTopic, user_id } = req.body;

    if (!user_id || !selectedTopic || !message) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const user = await prisma.users.findUnique({
      where: { user_id },
      select: {
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const supportTicket = await prisma.supportTicket.create({
      data: {
        user_id,
        title: selectedTopic,
        description: message,
      },
    });

    const token = await generateChatAccessToken(user_id);
    if (!token) {
      return res.status(500).json({
        error: "Failed to generate chat access token",
      });
    }

    const createToken = await prisma.supportTicketAccessToken.create({
      data: {
        token,
        user_id,
        ticket_id: supportTicket.ticket_id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    if (!createToken) {
      return res.status(500).json({
        error: "Failed to create chat access token",
      });
    }

    res.status(200).json({
      message:
        "Support ticket created successfully, we will get back to you soon",
    });

    const chatLink =
      `${process.env.BASE_URL}/support/users/chat?access_token=` + token;

    process.nextTick(async () => {
      try {
        const assignedSupportTicket = await findAndAssignSupportTicket(
          supportTicket.ticket_id
        );
        if (assignedSupportTicket) {
          io.emit("newSupportTicket", assignedSupportTicket);
          await sendChatLink(user.email, chatLink);
        } else {
          console.error(`Failed to assign ticket #${supportTicket.ticket_id}`);
        }
      } catch (error) {
        console.error(
          `Error assigning ticket #${supportTicket.ticket_id}:`,
          error
        );
      }
    });
  } catch (error) {
    console.error("Error in createSupportTicket:", error);
    res.status(500).json({ error: "Failed to create support ticket" });
  }
};

export const verifyChatAccessToken = async (req, res) => {
  try {
    const { userId, token } = req.query;

    if (!userId || !token) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
      });
    }
    const accesstoken = await prisma.supportTicketAccessToken.findFirst({
      where: {
        token,
        user_id: parseInt(userId),
      },
      select: {
        expires_at: true,
        is_used: true,
        ticket_id: true,
        ticket: {
          select: {
            status: true,
          },
        },
      },
    });
    if (!accesstoken) {
      return res.status(400).json({
        error: "Invalid access token",
      });
    }

    if (accesstoken.ticket.status == "closed") {
      return res.status(200).json({
        error: "This ticket has been closed please request a new one ",
      });
    }
    if (!accesstoken) {
      return res.status(400).json({
        error: "Invalid access token",
      });
    }

    if (accesstoken.expires_at < new Date()) {
      return res.status(400).json({
        error: "Access token has expired",
      });
    }
    if (accesstoken.is_used) {
      return res.status(400).json({
        error: "Access token has been used",
      });
    }
    await prisma.supportTicket.update({
      where: {
        ticket_id: accesstoken.ticket_id,
      },
      data: {
        status: "in_progress",
      },
    });

    res.status(200).json({
      isValid: true,
      ticketId: accesstoken.ticket_id,
    });
  } catch (error) {
    console.error("Error verifying token:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token format",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token has expired",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getTicketData = async (req, res) => {
  try {
    const { ticketId } = req.query;
    if (!ticketId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        ticket_id: parseInt(ticketId),
      },
      select: {
        ticket_id: true,
        title: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
        assign_to: true,
        SupportTicketMessage: true,
      },
    });
    const supportUser = await prisma.users.findFirst({
      where: {
        user_id: ticket.assign_to,
      },
      select: {
        full_name: true,
        user_id: true,
      },
    });

    const formatData = {
      ticket_id: ticket.ticket_id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      created_at: ticket.created_at,
      assign_to: ticket.assign_to,
      supportUser: {
        fullname: supportUser.full_name,
        supportUserId: supportUser.user_id,
      },
      messages: ticket.SupportTicketMessage.map((message) => ({
        message_id: message.message_id,
        message: message.message,
        user_id: message.user_id,
        ticket_id: message.ticket_id,
        sent_at: message.created_at,
        is_read: message.is_read,
      })),
    };

    if (ticket) {
      res.status(200).json({
        ticket: formatData,
      });
    } else {
      res.status(404).json({
        error: "Ticket not found",
        r,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
      r,
    });
  }
};
export const getSupportTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log(req.user);

    const supportTickets = await prisma.supportTicket.findMany({
      where: {
        assign_to: parseInt(req.user.userId),
      },
      select: {
        ticket_id: true,
        title: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        SupportTicketMessage: {
          select: {
            message_id: true,
            user_id: true,
            message: true,
            is_read: true,
            created_at: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedTickets = supportTickets.map((ticket) => ({
      ticket_id: ticket.ticket_id,
      user: ticket.user,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      created_at: ticket.created_at.toISOString(),
      updated_at: ticket.updated_at.toISOString(),
      messages: ticket.SupportTicketMessage.map((message) => ({
        message_id: message.message_id,
        sender: message.user_id === ticket.user.user_id ? "user" : "support",
        message: message.message,
        sent_at: message.created_at.toISOString(),
        is_read: message.is_read,
      })),
    }));
    res.status(200).json(formattedTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { ticket_id, message, user_id } = req.body;
    if (!ticket_id || !message || !user_id) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const findTicket = await prisma.supportTicket.findUnique({
      where: { ticket_id },
      include: { user: true },
    });

    if (!findTicket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        message,
        user_id,
        ticket_id,
        created_at: new Date(),
      },
      include: {
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    const messageData = {
      message_id: newMessage.message_id,
      message: newMessage.message,
      sent_at: newMessage.created_at.toISOString(),
      user_id: newMessage.user_id,
      ticket_id: newMessage.ticket_id,
      user: newMessage.user,
    };

    io.emit("newMessage", messageData);

    res.status(200).json(messageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.query;

    const { userId, status } = req.body;

    if (!ticketId || !userId || !status) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        role: true,
      },
    });
    if (user.role !== "support") {
      return res.status(401).json({
        error: "You dont have permission to change status",
      });
    }
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        ticket_id: parseInt(ticketId),
      },
    });
    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    if (ticket) {
      const newStatus = await prisma.supportTicket.update({
        where: {
          ticket_id: parseInt(ticketId),
        },
        data: {
          status: status,
        },
      });
      if (!newStatus) {
        return res.status(400).json({
          error: "error while update ticket status",
        });
      }

      io.emit("newstatus", newStatus);
      return res.status(200).json({
        message: `Ticket #${ticket.ticket_id} status updated`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
