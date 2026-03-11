import { Amplify } from "aws-amplify";
import { 
  signUp, confirmSignUp, signIn, signOut ,
  // fetchAuthSession, 
} from "aws-amplify/auth";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-southeast-2_xILaYFqSf",
      userPoolClientId: "1lfnvk3ehjtttts59mvvibpe46",
      loginWith: {
        email: true
      }
    }
  }
});


export async function register(email: string, password: string) {
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email
      }
    }
  });

  return result;
}


export async function confirm(email: string, code: string) {
  await confirmSignUp({
    username: email,
    confirmationCode: code
  });
}


export async function login(email: string, password: string) {
  const result = await signIn({
    username: email,
    password
  });

  return result;
}

export async function logout(){await signOut();}

// export async function getToken() {
//   const session = await fetchAuthSession();

//   return session.tokens?.idToken?.toString();
// }

// const token = await getToken();

// await fetch(`url`, {
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json"
//   },
// });
