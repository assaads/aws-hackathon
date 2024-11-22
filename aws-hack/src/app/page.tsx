

import { Toaster } from "@/components/ui/toaster"
import SocialMediaPostCreator from "./social-media-post-creator"

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Social Media Post Creator</h1>
      <SocialMediaPostCreator />
      <Toaster />
    </div>
  )
}

