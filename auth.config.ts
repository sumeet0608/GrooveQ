
import type { NextAuthConfig } from "next-auth"
import bcrypt from 'bcryptjs'
import Credentials from 'next-auth/providers/credentials'
import { LoginSchema } from "./schema"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default 
{ 
    providers: [
        
        Credentials({
            
            async authorize(credentials){
                const validatedFields = LoginSchema.safeParse(credentials);

                if(validatedFields.success){
                    const { email, password } = validatedFields.data;
                    const user = await prisma.user.findUnique({
                        where: { email }
                      });
                  
                    if(!user || !user.password) return null;

                    const passwordMatch = await bcrypt.compare(password,user.password)

                    if(passwordMatch)
                        return user

                }
                return null
            }
        })
        
    ] 


}satisfies NextAuthConfig