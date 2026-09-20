import {
  createContext,
  useContext,
  useState
} from "react";


const AuthContext = createContext<any>(null);



export function AuthProvider(
  {
    children
  }: {
    children: React.ReactNode
  }
) {


  const [user, setUser] = useState<any>(() => {


    const savedUser =
      localStorage.getItem("user");


    if(savedUser){

      try{

        return JSON.parse(savedUser);

      }
      catch{

        localStorage.removeItem("user");

        return null;

      }

    }


    return null;


  });





  function login(data:any){


    console.log(
      "LOGIN DATA:",
      data
    );


    const userData =
      data.user;



    setUser(
      userData
    );



    localStorage.setItem(

      "user",

      JSON.stringify(userData)

    );



    // مهم:
    // بک‌اند تو access_token برمی‌گرداند

    localStorage.setItem(

      "token",

      data.access_token

    );


    console.log(
      "SAVED USER:",
      userData
    );


    console.log(
      "SAVED TOKEN:",
      data.access_token
    );


  }







  function logout(){


    setUser(null);



    localStorage.removeItem(
      "user"
    );


    localStorage.removeItem(
      "token"
    );


  }







  return (

    <AuthContext.Provider

      value={{

        user,

        login,

        logout

      }}

    >

      {children}

    </AuthContext.Provider>

  );


}








export function useAuth(){


  return useContext(
    AuthContext
  );


}