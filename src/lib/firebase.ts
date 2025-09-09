// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCC5XNNAHcm2gtkI_Q2ToTzEXmlQkwDxSk",
  authDomain: "zolvit-ai-voice-chat.firebaseapp.com",
  projectId: "zolvit-ai-voice-chat",
  storageBucket: "zolvit-ai-voice-chat.appspot.com",
  messagingSenderId: "774024292135",
  appId: "1:774024292135:web:f1401d1755b31161e7ab02"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
