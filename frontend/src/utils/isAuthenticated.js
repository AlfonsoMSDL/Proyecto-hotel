export default function isAuthenticated(){
    return localStorage.getItem("token")?true:false;
}