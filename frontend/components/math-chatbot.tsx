'use client'

import * as React from 'react'
import { Book, Menu, Moon, Send, Sun } from 'lucide-react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const chapters = [
  { id: 1, title: "Introduction" },
  { id: 2, title: "Real Numbers" },
  { id: 3, title: "Continuous Functions" },
  { id: 4, title: "The Riemann Integral" },
  { id: 5, title: "Sequences of Functions" },
  { id: 6, title: "Metric Spaces" },
]

const initialMessages: Message[] = [
  { id: 1, sender: 'bot', content: 'Welcome to the MATH2122 Real Analysis chatbot! How can I assist you today?' },
]

interface Message {
  id: number
  sender: 'bot' | 'user'
  content: string
}

type TypeTextCallback = (partialText: string) => void

export default function MathChatbot() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const typeText = (text: string, callback: TypeTextCallback): void => {
    let index = 0
    const revealText = (): void => {
      callback(text.slice(0, index + 1))
      index++
      if (index < text.length) {
        setTimeout(revealText, 50) // Adjust speed here
      }
    }
    revealText()
  }

  const handleSend = async () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { id: prev.length + 1, sender: 'user', content: input }])
      setInput('')
      setIsLoading(true)

      try {
        const response = await fetch("http://localhost:5000/generate-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        })

        if (!response.ok) {
          throw new Error("Error fetching response")
        }

        const data = await response.json()
        
        setMessages(prev => [
          ...prev,
          { id: prev.length + 1, sender: 'bot', content: "" }
        ])

        typeText(data.response, (partialText) => {
          setMessages(prev =>
            prev.map((msg, idx) =>
              idx === prev.length - 1
                ? { ...msg, content: partialText }
                : msg
            )
          )
        })
      } catch (error) {
        setMessages(prev => [
          ...prev,
          { id: prev.length + 1, sender: 'bot', content: "An error occurred while fetching the response." }
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  return (
    <SidebarProvider>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar className="w-64 bg-white dark:bg-gray-800 transition-colors duration-200">
          <SidebarHeader className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <Book className="mr-2" />
              MATH2122
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground">Chapters</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chapters.map((chapter) => (
                    <SidebarMenuItem key={chapter.id}>
                      <SidebarMenuButton asChild>
                        <button className="w-full text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                          {chapter.title}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col bg-background">
          <header className="bg-card border-b dark:border-gray-700 p-4 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4 md:hidden">
                <Menu className="text-muted-foreground" />
              </SidebarTrigger>
              <h1 className="text-xl font-semibold text-primary">Real Analysis Chatbot</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-muted-foreground"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle dark mode</span>
            </Button>
          </header>

          <main className="flex-1 p-4 flex flex-col">
            <ScrollArea className="flex-1 bg-card rounded-lg shadow-inner p-4 transition-colors duration-200">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(
                          /\$\$(.*?)\$\$/g,
                          (_, latex) => katex.renderToString(latex, { throwOnError: false })
                        ),
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-muted text-muted-foreground">
                    <div className="animate-pulse">Typing<span className="animate-bounce">...</span></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </ScrollArea>

            <div className="mt-4 flex">
              <Input
                type="text"
                placeholder="Ask a question about Real Analysis..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 mr-2 bg-background text-foreground"
              />
              <Button onClick={handleSend} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="mr-2" />
                Send
              </Button>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}