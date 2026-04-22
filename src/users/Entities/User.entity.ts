import { Generic } from "src/Generic/generic";
import { UserRole } from "../Enums/User.enum";

export class User extends Generic {
    id ?: string ;
    Firstname ?: string ;
    Secondname ?: string ;
    Email ?: string ;
    Password ?: string ;
    Role ?: UserRole ;
    
    


    

}