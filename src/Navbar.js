import { Link } from "react-router-dom";

const Navbar = () => {
    return (  
    <nav className="navbar">
        <h1>Netflix Originals</h1>
        <div className="links">
            <Link to="/">Home</Link>
            <Link to="/vis">Our Question</Link>
        </div>
    </nav>
    );
}
 
export default Navbar;