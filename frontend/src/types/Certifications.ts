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


interface CertificationVerifyData{
    id:number;
    issued_at:Date,
    certification_url:string,
    user:{
        full_name: string,
        email: string,
    },
    course:{
        title:string,
        description:string,
        learning_outcomes:string[]
    }
}
export type { Certification  ,CertificationVerifyData}