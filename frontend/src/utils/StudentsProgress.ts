import { StudentProgress } from "../types/StudentsProgress";

export const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-700 bg-green-100";
    if (progress >= 60) return "text-yellow-700 bg-yellow-100";
    return "text-red-700 bg-red-100";
};

export const getScoreColor = (score: number) => {
    if (score >= 80) return "text-blue-700 bg-blue-100";
    if (score >= 60) return "text-purple-700 bg-purple-100";
    return "text-orange-700 bg-orange-100";
};

export const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

export const exportCSV = (students: StudentProgress[]) => {
    const csvContent = [
        "Name,Email,Course,Progress (%),Quiz Score (%),Certificate Eligible,Last Login",
        ...students.map(
            (student) =>
                `"${student.full_name}","${student.email}","${student.enrollment.course_title
                }","${student.progress}","${student.avg_quiz_score}","${student.enrollment.is_eligible_for_certificate ? "Yes" : "No"
                }","${formatDate(student.lastLogin)}"`
        ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_progress_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
};