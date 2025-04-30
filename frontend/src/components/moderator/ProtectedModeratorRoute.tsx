import { Navigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

 const ProtectedModeratorRoute = ({element}:{element:React.ReactNode}) => {
    const {user} = useAuth()
    if(!user || user.role !== 'moderator'){
       return <Navigate to={'/'} />
    }
        return <>{element}</>;
}
  export default ProtectedModeratorRoute;
