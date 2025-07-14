interface Certification {
    id: number;
    user_id: number;
    course_id: number;
    requested_at: string;
    status: "pending" | "approved" | "rejected";
    verification_code: string;
    course_title: string;
    user_full_name: string;
    user_email: string

}

export type { Certification }