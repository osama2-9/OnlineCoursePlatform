import schedule from "node-schedule";
import { assignmentDeadline } from "./notifications.js";
import { getAssignmentesDeadlineDate } from "../controllers/assignmentsController.js";
import { prisma } from "../prisma/prismaClint.js";
export async function scheduleAssignmentReminder(courseId) {
  try {
    const deadlineDate = await getAssignmentesDeadlineDate(courseId);

    if (!deadlineDate) {
      throw new Error("No deadline date found");
    }

    if (deadlineDate < new Date()) {
      throw new Error("Deadline has already passed");
    }

    const reminderDate = new Date(deadlineDate);
    reminderDate.setHours(reminderDate.getHours() - 24);

    if (reminderDate <= new Date()) {
      await assignmentDeadline(courseId);
      return null;
    }

    const reminderJob = schedule.scheduleJob(reminderDate, async () => {
      console.log(`[REMINDER] Sending notification for course ${courseId}`);
      await assignmentDeadline(courseId);
    });

    return reminderJob;
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    throw error;
  }
}
export async function rescheduleAllReminders() {
  try {
    const upcomingAssignments = await prisma.assignments.findMany({
      where: {
        end_date: { gt: new Date() },
       },
      select: {
        course_id: true,
      },
    });

    for (let assignments of upcomingAssignments) {
      await scheduleAssignmentReminder(assignments.course_id);
    }
    console.log(`Rescheduled ${upcomingAssignments.length} reminders`);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
