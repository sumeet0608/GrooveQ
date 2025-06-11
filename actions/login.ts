'use server'

import { signIn } from "@/auth";
import { CredentialsSignin } from "next-auth";

const  loginHanlder  = async (email:string, password:string) => {

    try {
        await signIn('credentials', {
            email,
            password,
        });
  
    } catch (error:any) {
      const err = error as CredentialsSignin
      return err.cause
    }
  };


export { loginHanlder }