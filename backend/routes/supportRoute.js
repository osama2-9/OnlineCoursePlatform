import express from 'express'
import {protectedRoute} from '../middlewares/protectedRoute.js'
import { createSupportTicket, getSupportTickets, getTicketData, sendMessage,verifyChatAccessToken } from '../controllers/supportController.js'
import { checkRole } from '../middlewares/checkRole.js'
const supportRoute = express.Router()

supportRoute.post('/create-support-ticket',protectedRoute ,createSupportTicket),
supportRoute.get('/get-support-tickets',checkRole(['support','admin']) ,getSupportTickets)
supportRoute.post('/send-message' ,sendMessage)
supportRoute.get('/verify-access-token',verifyChatAccessToken)
supportRoute.get('/get-ticket',getTicketData)

export default supportRoute