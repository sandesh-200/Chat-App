import { loginUser } from "@/api/auth";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userLoginSchema } from "@/features/auth/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type z from "zod";

type LoginInput = z.infer<typeof userLoginSchema>;

export default function LoginForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginUser(data);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });

      toast.success("Login successful!", {
        position: "top-right",
        richColors: true,
      });
      navigate('/')
    } catch (error: any) {
      console.error(error.response.data.message)
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full items-center gap-4">

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                  </p>
            )}

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive">
                  {errors.password.message}
                  </p>
            )}

          </div>

        <Button disabled={isSubmitting} type="submit" className="w-full mt-5">
          {
            isSubmitting?(
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ):(
              "Login"
            )
          }
        </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">

          <a
            href="/forgot-password"
            className="text-muted-foreground text-sm hover:text-primary hover:underline"
          >
            Forgot Password?
          </a>
      </CardFooter>
    </Card>
  );
}
