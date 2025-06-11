import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc"
import { LoginForm } from '@/components/login-form';
import { signIn } from "@/auth";


const Page = () => {
 
  return (
    <Card className="w-[350px]">
      
      <CardHeader className="text-2xl font-bold text-center">Login</CardHeader>

      <LoginForm/>

      <CardFooter className="flex flex-col space-y-4">
        <Separator />
        
        <form className="flex items-center w-full gap-x-2"
          action={async()=>{
            "use server"
            await signIn("google",{callbackUrl:"/dashboard"});
          }}
        >

            <Button size="lg" className="w-full hover:bg-white" variant={"outline"} type="submit">
              <FcGoogle className="h-5 w-5" />
            </Button>
        </form>
        
        <div className="text-center  cursor-pointer text-lg">
        Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-500 hover:underline cursor-pointer ">
            Register
          </Link>
        </div>
      </CardFooter>

    </Card>
  );
};

export default Page;