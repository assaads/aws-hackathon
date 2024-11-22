import SocialMediaPostCreator from "./social-media-post-creator"
import { Toaster } from "@/components/ui/toaster"

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Social Media Post Creator</h1>
      <SocialMediaPostCreator />
      <Toaster />
    </div>
  )
}

