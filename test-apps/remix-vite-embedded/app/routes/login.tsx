import { Form, Link } from "@remix-run/react"; 

interface SocialButtonProps { 
  label: string;
}
 

export default function LoginRoute() {
  return (
    <>
      <Link to="/">Login</Link>
      
    </>
  );
}
