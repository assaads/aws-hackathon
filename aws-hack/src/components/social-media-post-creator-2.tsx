"use client"

import { useState } from "react"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const socialMediaPlatforms = [
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter" },
  { id: "instagram", name: "Instagram" },
  { id: "linkedin", name: "LinkedIn" },
]

export default function SocialMediaPostCreator() {
  const [postContent, setPostContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [generatedHashtags, setGeneratedHashtags] = useState("")
  const { toast } = useToast()

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      await analyzeImage(file)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    try {
      const base64Image = await convertToBase64(file)
      
      const response = await fetch('https://naaf6gbzt9.execute-api.us-west-2.amazonaws.com/Prod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      })

      if (!response.ok) {
        throw new Error('Image analysis failed')
      }

      const data = await response.json()
      setGeneratedDescription(data)
      setGeneratedHashtags(data)
      setPostContent(data)

      toast({
        title: "Image Analyzed",
        description: "Description and hashtags have been generated based on your image.",
      })
    } catch (error) {
      console.error('Error analyzing image:', error)
      toast({
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const submitPost = async (description: string, image: string, platforms: string[]) => {
    try {
      const response = await fetch('https://hc7lg2z8c3.execute-api.us-west-2.amazonaws.com/postimage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          image,
          platforms,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit post')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error submitting post:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (postContent.trim() === "" || selectedPlatforms.length === 0 || !image) {
      toast({
        title: "Error",
        description: "Please enter a post, select at least one platform, and upload an image.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const base64Image = await convertToBase64(image)
      await submitPost(postContent, base64Image, selectedPlatforms)

      toast({
        title: "Success",
        description: `Your post has been uploaded to ${selectedPlatforms.join(", ")}.`,
      })

      // Reset form
      setPostContent("")
      setSelectedPlatforms([])
      setImage(null)
      setGeneratedDescription("")
      setGeneratedHashtags("")
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload the post because of ${error} . Please try again`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Social Media Post</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-content">Post Content</Label>
            <Textarea
              id="post-content"
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
            />
            {isAnalyzing && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing image...</span>
              </div>
            )}
          </div>
          {generatedDescription && (
            <div className="space-y-2">
              <Label>Generated Description</Label>
              <p className="text-sm text-gray-600">{generatedDescription}</p>
            </div>
          )}
          {generatedHashtags && (
            <div className="space-y-2">
              <Label>Generated Hashtags</Label>
              <p className="text-sm text-gray-600">{generatedHashtags}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Select Platforms</Label>
            <div className="flex flex-wrap gap-4">
              {socialMediaPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                  />
                  <Label htmlFor={platform.id}>{platform.name}</Label>
                </div>
              ))}
            </div>
          </div>
          {(postContent || image) && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {postContent && <p className="mb-2">{postContent}</p>}
                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="max-w-full h-auto rounded-md"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUploading || isAnalyzing} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Post to Selected Platforms"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

