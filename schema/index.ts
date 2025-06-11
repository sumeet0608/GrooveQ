

import * as z from 'zod'

export const LoginSchema = z.object({
    email:z.string().email({message:'email is required'}),
    password:z.string().min(1,{message:'Password is required'}),
})

export const RegisterSchema = z.object({
    email:z.string().email({message:'email is required'}),
    password:z.string().min(8,{message:'Minimum 8 characters is required'}),
    name :z.string()
})


export const spaceSchema = z.object({
    name: z.string(),
    description: z.string(),
})

export const streamSchema = z.object({
    hostId: z.string(),
    spaceId: z.string(),
    url: z.string()
})

export const upvoteSchema = z.object({
    songId: z.string()
})  