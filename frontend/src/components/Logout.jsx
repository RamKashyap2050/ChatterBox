import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();

    const handleLogout = async () => {
        try {
            await axios.get('Users/logout', { withCredentials: true });
            setUser(null); // Clear user context or state
            navigate('/signup'); // Redirect to login page
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default LogoutButton;
