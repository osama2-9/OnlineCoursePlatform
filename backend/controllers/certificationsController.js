import { prisma } from "../prisma/prismaClint.js";
import { v4 as uuidv4 } from "uuid";
import { generateCertificateForUpload } from "../services/certificationsGenerate.js";
import { supabase } from "../services/supabase.js";


export const getCertificationsRequests = async (req, res) => {
  try {
    const { instructorId } = req.query;
    if (!instructorId) {
      return res.status(400).json({
        error: "Instructor Id Required",
      });
    }
    const courses = await prisma.courses.findMany({
      where: {
        instructor_id: parseInt(instructorId),
      },
      select: {
        course_id: true,
      },
    });
    if (courses.length === 0) {
      return res.status(404).json({
        courses: [],
      });
    }
    const courseIds = courses.map((course) => course.course_id);
    const certifications = await prisma.certificateRequest.findMany({
      where: {
        course_id: {
          in: courseIds,
        },
      },
      select: {
        id: true,
        user_id: true,
        course_id: true,
        requested_at: true,
        status: true,
        verification_code: true,
        course: {
          select: {
            title: true,
          },
        },

        user: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
    });

    const formattedCertifications = certifications.map((certification) => {
      return {
        id: certification.id,
        user_id: certification.user_id,
        course_id: certification.course_id,
        requested_at: new Date(certification.requested_at).toLocaleDateString(),
        status: certification.status,
        verification_code: certification.verification_code,
        course_title: certification.course.title,
        user_full_name: certification.user.full_name,
        user_email: certification.user.email,
      };
    });

    return res.status(200).json({
      certifications: formattedCertifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const approvCertificationRequest = async (req, res) => {
  try {
    const { userId, courseId, certificationId , instructorId } = req.body;
    if (!userId || !courseId || !certificationId || !instructorId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }


    const courses = await prisma.courses.findUnique({
      where: {
        course_id: parseInt(courseId),
      },
      select: {
        instructor_id: true,
      },
    });

    if (!courses) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    if (courses.instructor_id != parseInt(instructorId)) {
      return res.status(401).json({
        error: "You don't have permission to handle this course",
      });
    }

    const certificationRequest = await prisma.certificateRequest.findUnique({
      where: {
        id: parseInt(certificationId),
      },
      select: {
        verification_code: true,
        course: {
          select: {
            title: true,
            course_id: true,
          },
        },
        user: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
    });
    if (!certificationRequest) {
      return res.status(404).json({
        error: "Certification request not found",
      });
    }

    const updatedCertification = await prisma.certificateRequest.update({
      where: {
        id: parseInt(certificationId),
      },
      data: {
        status: "approved",
        issued_at: new Date(),
      },
    });
    if (!updatedCertification) {
      return res.status(400).json({
        error: "Error while approving the certification request",
      });
    }
    return res.status(200).json({
      message: "Certification request approved successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCourseToCertificate = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const userCourses = await prisma.enrollments.findMany({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        course_id: true,
        status: true,
        enrollment_id: true,
        enrollment_date: true,
      },
    });
    const courseIds = userCourses.map((course) => course.course_id);
    const courses = await prisma.courses.findMany({
      where: {
        course_id: { in: courseIds },
      },
      select: {
        course_id: true,
        title: true,
        course_img: true,
        category: true,
        description: true,
        instructor: {
          select: {
            user_id: true,
            full_name: true,
          },
        },
      },
    });

    const enrollments = userCourses.map((course) => {
      return {
        course_id: course.course_id,
        status: course.status,
        enrollment_id: course.enrollment_id,
        enrollment_date: course.enrollment_date,
      };
    });

    const lessons = await prisma.lessons.findMany({
      where: {
        course_id: { in: courseIds },
      },
      select: {
        lesson_id: true,
        course_id: true,
      },
    });

    const requestedCertificates = await prisma.certificateRequest.findMany({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        user_id: true,
        course_id: true,
        status: true,
      },
    });
    const requestedCourseIds = requestedCertificates.map(
      (request) => request.course_id
    );

    const progress = await prisma.userProgress.findMany({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        course_id: true,
        lesson_id: true,
        is_completed: true,
      },
    });

    const lessonsByCourse = {};
    lessons.forEach((lesson) => {
      if (!lessonsByCourse[lesson.course_id])
        lessonsByCourse[lesson.course_id] = new Set();
      lessonsByCourse[lesson.course_id].add(lesson.lesson_id);
    });

    const completedByCourse = {};
    progress.forEach((item) => {
      if (item.is_completed) {
        if (!completedByCourse[item.course_id])
          completedByCourse[item.course_id] = new Set();
        completedByCourse[item.course_id].add(item.lesson_id);
      }
    });

    const mergedData = enrollments.map((enrollment) => {
      if (!enrollment.course_id) return null;
      const totalLessons = lessonsByCourse[enrollment.course_id]
        ? lessonsByCourse[enrollment.course_id].size
        : 0;
      const completedLessons = completedByCourse[enrollment.course_id]
        ? completedByCourse[enrollment.course_id].size
        : 0;
      const progressPercentage =
        totalLessons > 0
          ? Math.min(Math.floor((completedLessons / totalLessons) * 100), 100)
          : 0;
      const course = courses.find(
        (course) => course.course_id === enrollment.course_id
      );
      return {
        course_id: enrollment.course_id,
        status: enrollment.status,
        enrollment_id: enrollment.enrollment_id,
        enrollment_date: enrollment.enrollment_date,
        title: course.title,
        course_id: course.course_id,
        thumbnail: course.course_img,
        category: course.category,
        description: course.description,
        instructor: course.instructor.full_name,
        progress: progressPercentage,
        completed: progressPercentage === 100,
        completedAt: enrollment.enrollment_date,
        enrolledAt: enrollment.enrollment_date,
        certificateRequested: requestedCourseIds.includes(enrollment.course_id),
        certificateUrl: null,
        certificateStatus:
          requestedCertificates.find(
            (request) => request.course_id === enrollment.course_id
          )?.status || "not_requested",
      };
    });

    return res.status(200).json({
      data: mergedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const requestACertificate = async (req, res) => {
  try {
    let uuid = uuidv4();
    const { user_id, course_id } = req.body;

    console.log(course_id, user_id);
    if (!user_id || !course_id) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const userCourse = await prisma.enrollments.findFirst({
      where: {
        user_id: parseInt(user_id),
        course_id: parseInt(course_id),
      },
      select: {
        status: true,
      },
    });

    if (userCourse && userCourse.status !== "completed") {
      return res.status(400).json({
        error: "You are not completed this course",
      });
    }

    const createCertificateRequest = await prisma.certificateRequest.create({
      data: {
        user_id: parseInt(user_id),
        course_id: parseInt(course_id),
        requested_at: new Date(),
        status: "pending",
        verification_code: uuid,
      },
    });
    if (!createCertificateRequest) {
      return res.status(400).json({
        error: "Error while try to request a certificate",
      });
    }
    return res.status(201).json({
      message: "Certificate Requested Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const generateAndSendCertification = async (req ,res)=>{
  try {
    const {userId , courseId , certificationId } = req.body;
    if (!userId || !courseId || !certificationId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const userCourse = await prisma.enrollments.findFirst({
      where: {
        user_id: parseInt(userId),
        course_id: parseInt(courseId),
      },
      select: {
        course:{
          select:{
            title:true,

          }
        },
        user:{
          select:{
            full_name:true,
            email:true,
          }
        },
        
        status: true,
      },
    });
    if (userCourse && userCourse.status !== "completed") {
      return res.status(400).json({
        error: "You are not completed this course",
      });
    }
    const certificationRequest = await prisma.certificateRequest.findUnique({
      where: {
        id: parseInt(certificationId),
      },
      select: {
        user_id: true,
        course_id: true,
        status: true,
        verification_code:true,
        requested_at:true,
      },
    });
    if (!certificationRequest) {
      return res.status(404).json({
        error: "Certification request not found",
      });
    }
    if (certificationRequest.status !== "approved") {
      return res.status(400).json({
        error: "Certification request is not approved",
      });
    }
    const {buffer , filename, mimeType} = await generateCertificateForUpload({
      verificationCode: certificationRequest.verification_code,
      learnerName: userCourse.user.full_name,
      email: userCourse.user.email,
      courseName: userCourse.course.title,
      completionDate: certificationRequest.requested_at,
    })

    const {data ,error} = await supabase.storage.from('uplearn')
    .upload(`certificates/${userCourse.user.full_name}/${filename}` , buffer , {
      upsert: false,
      contentType: mimeType,
    })

    console.log(data)
    if (error) {
      return res.status(400).json({
        error: "Error while try to upload certificate",
      });
    }
 
    const certicateUrl = `https://ykelalsdjwktqkeoxerf.supabase.co/storage/v1/object/public/${data.fullPath}`;
    const updateCertificationRequest = await prisma.certificateRequest.update({
      where: {
        id: parseInt(certificationId),
      },
      data: {
        issued_at: new Date(),
        certificate_url: certicateUrl,
      },
    });
    if (!updateCertificationRequest) {
      return res.status(400).json({
        error: "Error while try to update certification request",
      });
    }
    return res.status(200).json({
      message: "Certificate generated and sent successfully",
    });
    
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error:"Internal server error"
    })
    
    
  }
}