import { stripe } from "../index.js";
import { prisma } from "../prisma/prismaClint.js";
import dotenv from "dotenv";
import { genreateAccessCourseToken } from "../utils/generateAccessToken.js";
dotenv.config();

export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({
        error: "Error while trying to make payment. Try again later.",
      });
    }

    const courseID = parseInt(courseId);
    const userAlreadyEnrolled = await prisma.enrollments.findFirst({
      where: {
        user_id: parseInt(userId),
        course_id: courseID,
      },
    });

    if (userAlreadyEnrolled) {
      return res.status(400).json({
        error: "You are already enrolled in this course",
      });
    }
    const course = await prisma.courses.findUnique({
      where: {
        course_id: courseID,
      },
      select: {
        title: true,
        course_img: true,
        price: true,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course?.title,
              images: [course.course_img],
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/payment/success?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel`,
      mode: "payment",
      metadata: {
        courseId,
        userId,
      },
    });

    await prisma.payments.create({
      data: {
        amount: course.price, // Price of the course
        sessionId: session.id, // Stripe session ID
        stripe_payment_intent_id: session.id, // Stripe payment intent ID
        payment_status: "pending", // Set initial payment status to "pending"
        user: {
          connect: { user_id: parseInt(userId) }, // Use connect to link the user by user_id
        },
        course: {
          connect: { course_id: parseInt(courseId) }, // Use connect to link the course by course_id
        },
      },
    });

    return res.json({
      sessionId: session.id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const payment = await prisma.payments.findFirst({
      where: {
        stripe_payment_intent_id: sessionId,
      },
    });

    if (payment) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const { userId, courseId } = session.metadata;
        const userIdInt = parseInt(userId);
        const courseIdInt = parseInt(courseId);

        await prisma.payments.update({
          where: {
            stripe_payment_intent_id: sessionId,
          },
          data: {
            stripe_payment_intent_id: session.payment_intent,
            payment_status: "succeeded",
            user_id: userIdInt,
            course_id: courseIdInt,
            amount: session.amount_total / 100,
          },
        });

        const enrollment = await prisma.enrollments.create({
          data: {
            user_id: userIdInt,
            course_id: courseIdInt,
            access_granted: true,
            status: "active",
          },
        });

        const accessToken = genreateAccessCourseToken(
          userIdInt,
          enrollment.enrollment_id,
          courseIdInt
        );
        console.log("ACCESS TOKEN", accessToken);

        if (enrollment) {
          await prisma.enrollments.update({
            where: {
              enrollment_id: enrollment.enrollment_id,
            },
            data: {
              access_token: accessToken,
            },
          });
        }

        return res
          .status(200)
          .json({ message: "Payment confirmed", accessToken });
      } else {
        return res
          .status(400)
          .json({ error: "Payment not completed successfully." });
      }
    } else {
      return res.status(400).json({ error: "Payment session not found." });
    }
  } catch (error) {
    console.error("Error in handling payment success:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPayments = await prisma.payments.count();
    const payments = await prisma.payments.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: {
            full_name: true,
            is_active: true,
          },
        },
        course: {
          select: {
            title: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({
      totalPayments,
      totalPages: Math.ceil(totalPayments / limit),
      currentPage: page,
      payments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
