import { prisma } from "../prisma/prismaClint.js";
export const newAssignmentNotification = async (course_id) => {
    try {
        if (!course_id) {
            return;
        }
        const newNotification = await prisma.notifications.create({
            data: {
                course_with_id: course_id,
                type: "ASSIGNMENT_NEW",
                message: "A new assignment has been added to your course.",
                is_read: false,
            }
        })
        if (!newNotification) {
            throw new Error("feild to push notification")
        }
    } catch (error) {
        throw new Error("feild to push notification")


    }

}

export const newQuizNotification = async (course_id) => {
    try {
        if (!course_id) {
            return;
        }
        const newNotification = await prisma.notifications.create({
            data: {
                course_with_id: course_id,
                type: "QUIZ_NEW",
                message: "A new quiz has been added to your course.",
                is_read: false,
            }
        })
        if (!newNotification) {
            throw new Error("feild to push notification")
        }
    } catch (error) {
        throw new Error("feild to push notification")


    }

}

export const assignmentDeadline = async (course_id) => {
    try {
        if (!course_id) {
            return;
        }
        const newNotification = await prisma.notifications.create({
            data: {
                course_with_id: course_id,
                type: "ASSIGNMENT_DEADLINE",
                message: "The deadline for an assignment in your course is approaching.",
                is_read: false,
            }
        })
        if (!newNotification) {
            throw new Error("feild to push notification")
        }
    } catch (error) {
        throw new Error("feild to push notification")


    }

}
