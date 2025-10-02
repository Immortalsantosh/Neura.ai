import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../Context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"
import userImg from "../assets/user.gif"

interface GeminiResponse {
  type: string;
  userInput: string;
  response: string;
}

const Home: React.FC = () => {
  const context = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState<boolean>(false)
  const [userText, setUserText] = useState<string>("")
  const [aiText, setAiText] = useState<string>("")
  const isSpeakingRef = useRef<boolean>(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [ham, setHam] = useState<boolean>(false)
  const isRecognizingRef = useRef<boolean>(false)
  const isMountedRef = useRef<boolean>(true)
  const synth = window.speechSynthesis

  // Guard clause for context
  if (!context || !context.userData) {
    navigate("/signin")
    return null
  }

  const { userData, serverUrl, setUserData, getGeminiResponse } = context

  const handleLogOut = async (): Promise<void> => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
      navigate("/signin")
    }
  }

  const startRecognition = (): void => {
    if (!isMountedRef.current || !recognitionRef.current) return
    
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current.start()
        console.log("Recognition requested to start")
      } catch (error: any) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error)
        }
      }
    }
  }

  const speak = (text: string): void => {
    if (!isMountedRef.current || !text) return
    
    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = 'en-US' // Changed to English as responses are in English
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(v => v.lang.includes('en'))
    if (englishVoice) {
      utterence.voice = englishVoice
    }

    isSpeakingRef.current = true
    utterence.onend = () => {
      if (!isMountedRef.current) return
      // Don't clear aiText immediately, wait for user to see the response
      setTimeout(() => {
        if (isMountedRef.current) {
          setAiText("")
        }
      }, 1000)
      isSpeakingRef.current = false
      setTimeout(() => {
        if (isMountedRef.current) {
          startRecognition()
        }
      }, 800)
    }
    synth.cancel()
    synth.speak(utterence)
  }

  const handleCommand = (data: GeminiResponse): void => {
    const { type, userInput, response } = data
    speak(response)
    
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.google.com/search?q=${query}`, '_blank')
    }
    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank')
    }
    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank')
    }
    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank')
    }
    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank')
    }
    if (type === 'youtube-open') {
      window.open(`https://www.youtube.com/`, '_blank')
    }
    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
    }
  }

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser")
      return
    }

    const recognition: SpeechRecognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognitionRef.current = recognition
    isMountedRef.current = true

    // Start recognition after delay
    const startTimeout = setTimeout(() => {
      if (isMountedRef.current && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start()
          console.log("Recognition requested to start")
        } catch (e: any) {
          if (e.name !== "InvalidStateError") {
            console.error(e)
          }
        }
      }
    }, 1000)

    recognition.onstart = () => {
      isRecognizingRef.current = true
      if (isMountedRef.current) {
        setListening(true)
      }
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      if (isMountedRef.current) {
        setListening(false)
        if (!isSpeakingRef.current) {
          setTimeout(() => {
            if (isMountedRef.current) {
              try {
                recognition.start()
                console.log("Recognition restarted")
              } catch (e: any) {
                if (e.name !== "InvalidStateError") console.error(e)
              }
            }
          }, 1000)
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn("Recognition error:", event.error)
      isRecognizingRef.current = false
      if (isMountedRef.current) {
        setListening(false)
        if (event.error !== "aborted" && !isSpeakingRef.current) {
          setTimeout(() => {
            if (isMountedRef.current) {
              try {
                recognition.start()
                console.log("Recognition restarted after error")
              } catch (e: any) {
                if (e.name !== "InvalidStateError") console.error(e)
              }
            }
          }, 1000)
        }
      }
    }

    recognition.onresult = async (e: SpeechRecognitionEvent) => {
      try {
        const transcript = e.results[e.results.length - 1][0].transcript.trim()
        if (userData?.assistantName && transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
          if (isMountedRef.current) {
            setAiText("")
            setUserText(transcript)
          }
          recognition.stop()
          isRecognizingRef.current = false
          if (isMountedRef.current) {
            setListening(false)
          }
          
          const data = await getGeminiResponse(transcript)
          if (data && isMountedRef.current) {
            // Only set the response text, not the entire JSON
            setAiText(data.response)
            handleCommand(data)
            // Clear user text after a delay
            setTimeout(() => {
              if (isMountedRef.current) {
                setUserText("")
              }
            }, 2000)
          }
        }
      } catch (error) {
        console.error("Error processing speech result:", error)
        if (isMountedRef.current) {
          setUserText("")
          setAiText("Sorry, I couldn't process that request.")
        }
      }
    }

    // Initial greeting
    if (userData?.name) {
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
      greeting.lang = 'en-US'
      
      greeting.onend = () => {
        if (!isMountedRef.current) {
          window.speechSynthesis.cancel()
        }
      }
      
      window.speechSynthesis.speak(greeting)
    }

    return () => {
      isMountedRef.current = false
      clearTimeout(startTimeout)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log("Recognition already stopped")
        }
      }
      setListening(false)
      isRecognizingRef.current = false
      window.speechSynthesis.cancel()
    }
  }, [userData?.assistantName, userData?.name, getGeminiResponse])

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
        <button className='min-w-[150px] h-[60px]  text-black font-semibold   bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={() => navigate("/customize")}>Customize your Assistant</button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData?.history?.map((his: string, index: number) => (
            <div key={index} className='text-gray-200 text-[18px] w-full h-[30px]  '>{his}</div>
          ))}
        </div>
      </div>
      
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block ' onClick={() => navigate("/customize")}>Customize your Assistant</button>
      
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>
      
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]' />}
      {aiText && <img src={aiImg} alt="" className='w-[200px]' />}
    
      <h1 className='text-white text-[18px] font-semibold text-wrap text-center px-4 max-w-[600px]'>{userText ? userText : aiText ? aiText : null}</h1>
    </div>
  )
}

export default Home