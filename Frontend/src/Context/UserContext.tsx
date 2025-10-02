
import { createContext, useEffect, useState} from "react";
import type { ReactNode } from "react"
import axios from "axios";



// 1. Define type for user data (matching your Mongoose model)
export interface IUser {
  _id: string;
  name: string;
  email: string;
  assistantName?: string;
  assistantImage?: string;
  history?: string[];
  createdAt?: string;
  updatedAt?: string;
}


// 2. Define type for context value
interface UserDataContextType {
  serverUrl: string;
  userData: IUser | null;
  setUserData: React.Dispatch<React.SetStateAction<IUser | null>>;
  frontendImage: string | null;
  setFrontendImage: React.Dispatch<React.SetStateAction<string | null>>;
  backendImage: string | null;
  setBackendImage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  getGeminiResponse: (command: string) => Promise<any>;
}

// 3. Create context with default undefined
export const userDataContext = createContext<UserDataContextType | undefined>( undefined);

// 4. Props type for provider
interface UserContextProps {
  children: ReactNode;
}

// 5. Context provider component
function UserContext({ children }: UserContextProps) {
  const serverUrl = "https://neura-ai-xgwf.onrender.com";
  const [userData, setUserData] = useState<IUser | null>(null);
  const [frontendImage, setFrontendImage] = useState<string | null>(null);
  const [backendImage, setBackendImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data); // store backend user data
      // console.log(result.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };


  const getGeminiResponse=async (command: string)=>{
try {
  const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
  return result.data
} catch (error) {
  console.log(error)
}
    }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value: UserDataContextType = {
    serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
  };

  return (
   <userDataContext.Provider value={value}>
  {children}
</userDataContext.Provider>
  );
}

export default UserContext;




