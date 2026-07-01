import { Amplify } from "aws-amplify";
import { 
  signUp, confirmSignUp, signIn, signOut ,
  fetchAuthSession, 
} from "aws-amplify/auth";

const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
      loginWith: {
        email: true
      }
    }
  }
});


export async function register(email: string, password: string, nickname: string, userType: string) {
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        "nickname": nickname,
        "custom:userType": userType,
      }
    }
  });
  return result;
}


export async function confirm(email: string, code: string) {
  const response = await confirmSignUp({
    username: email,
    confirmationCode: code
  });
  return(response)
}


export async function login(email: string, password: string) {
  const result = await signIn({
    username: email,
    password
  });

  return result;
}

export async function logout(){await signOut();}

export async function getUserAttributes() {
  const session = await fetchAuthSession();
  const payload = session.tokens?.idToken?.payload;
  return {
    userId: payload?.sub,
    email: payload?.email,
    nickname: payload?.nickname,
    userType: payload?.["custom:userType"],
  };
}