// import LoginForm from "@/components/Login"
// import SignupForm from "@/components/Signup"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// export default function AuthPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <Tabs defaultValue="login" className="w-[400px]">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="login">Login</TabsTrigger>
//           <TabsTrigger value="register">Register</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="login">
//           <LoginForm />
//         </TabsContent>
        
//         <TabsContent value="register">
//           <SignupForm />
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

import LoginForm from "@/components/Login"
import SignupForm from "@/components/Signup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Header Section */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Get Started
        </h1>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="login" className="w-full max-w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        
        <TabsContent value="register">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}