import mongoose from "mongoose";
import { hashValue } from "../utils/bcrypt";
import { compareValue } from "../utils/bcrypt";


export interface UserDocument extends mongoose.Document{
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
    comparePassword(val:string): Promise<boolean>;
    omitPassword(): Pick<UserDocument, "_id" | "email" | "isVerified" | "createdAt" | "updatedAt" | "__v">;
}

const userSchema = new mongoose.Schema<UserDocument>({
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
    isVerified:{type:Boolean,default:false}
},{
    timestamps:true
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();

    }

    this.password=await hashValue(this.password);
    next();
})

userSchema.methods.comparePassword= async function(val:string){
    return compareValue(val, this.password);
}

userSchema.methods.omitPassword = function(){
    const user= this.toObject();
    delete user.password;
    return user;
}

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;