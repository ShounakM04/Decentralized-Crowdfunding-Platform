// import React from "react";
// import { Menu, Icon } from "semantic-ui-react";
// import "semantic-ui-css/semantic.min.css";
// import { Link } from "../routes";

// const Header = () => {
//   return (
//     <>
//       <Menu className="custom-header" size="large">
//         {/* Brand Logo / Home Link */}
//         <Link route="/" legacyBehavior>
//           <a className="item brand-logo">
//             <Icon name="cubes" className="brand-icon" />
//             CrowdCoin
//           </a>
//         </Link>

//         {/* Right Aligned Navigation Items */}
//         <Menu.Menu position="right">
//           <Link route="/" legacyBehavior>
//             <a className="item nav-link">Campaigns</a>
//           </Link>

//           <Link route="/campaigns/New" legacyBehavior>
//             <a className="item nav-link create-link">
//               <Icon name="add circle" />
//               Create Campaign
//             </a>
//           </Link>
//         </Menu.Menu>
//       </Menu>

//       {/* Scoped Styling for the Navigation Bar */}
//       <style jsx global>{`
//         .custom-header {
//           margin-top: 25px !important;
//           border-radius: 12px !important; /* Rounds the corners of the entire nav bar */
//           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
//           border: 1px solid #e5e7eb !important;
//           background-color: #ffffff !important;
//           padding: 4px 8px !important;
//           font-family: 'Inter', sans-serif !important;
//         }

//         /* Brand / Logo Styling */
//         .brand-logo {
//           font-weight: 700 !important;
//           font-size: 1.25rem !important;
//           color: #111827 !important;
//           letter-spacing: -0.02em !important;
//           transition: color 0.2s ease !important;
//         }

//         .brand-logo:hover {
//           color: #4f46e5 !important;
//           background: transparent !important; /* Removes default gray hover background */
//         }

//         .brand-icon {
//           color: #4f46e5 !important;
//           margin-right: 8px !important;
//         }

//         /* Standard Nav Links */
//         .nav-link {
//           font-weight: 500 !important;
//           color: #4b5563 !important;
//           font-size: 1rem !important;
//           transition: all 0.2s ease !important;
//           border-radius: 8px !important;
//           margin: 4px !important; /* Creates space between the links */
//         }

//         .nav-link:hover {
//           color: #111827 !important;
//           background-color: #f3f4f6 !important;
//         }

//         /* Prominent "Create Campaign" Link */
//         .create-link {
//           color: #4f46e5 !important;
//           font-weight: 600 !important;
//           background-color: #e0e7ff !important; /* Soft indigo background */
//           border: 1px solid #c7d2fe !important;
//         }

//         .create-link:hover {
//           background-color: #c7d2fe !important;
//           color: #4338ca !important;
//         }
//       `}</style>
//     </>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { Menu, Icon, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { Link } from "../routes";
import web3 from "../ethereum/web3";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// import { parseCookies } from 'nookies';
const Header = () => {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserAddress(data.user.ethAddress);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const tid = toast.loading("Requesting signature...");
    try {
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];

      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ethAddress: address })
      });
      const { nonce } = await nonceRes.json();

      const message = `Welcome to CrowdCoin! Please sign this message to log in.\n\nNonce: ${nonce}`;
      const signature = await web3.eth.personal.sign(message, address, "");

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ethAddress: address, signature })
      });

      if (verifyRes.ok) {
        setIsLoggedIn(true);
        setUserAddress(address);
        toast.success("Successfully logged in!", { id: tid });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed", { id: tid }); // Error!
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const tid = toast.loading("Logging out...");
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUserAddress("");
      toast.success("Logged out", { id: tid });
      window.location.href = "/"; 
    } catch (err) {
      toast.error("Logout failed", { id: tid });
    }
  };

  return (
    <>
    
      <Toaster position="top-center" />
      <Menu className="custom-header" size="large">
      <Link route="/" legacyBehavior><a className="item">CrowdCoin</a></Link>
      
      <Menu.Menu position="right">
        {/* If logged in, show Profile and Logout. If not, show Sign In */}
        {isLoggedIn ? (
          <>
            <Link route="/profile" legacyBehavior>
              <a className="item"><Icon name="user" /> My Profile</a>
            </Link>
            <Menu.Item>
                <Button color="red" basic onClick={handleLogout}>Logout</Button>
            </Menu.Item>
          </>
        ) : (
          <Menu.Item>
            <Button className="auth-btn" loading={loading} onClick={handleLogin}>
              <Icon name="user circle outline" /> Sign In
            </Button>
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>

      {/* Scoped Styling for the Navigation Bar */}
      <style jsx global>{`
        .custom-header {
          margin-top: 25px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          border: 1px solid #e5e7eb !important;
          background-color: #ffffff !important;
          padding: 4px 8px !important;
          font-family: 'Inter', sans-serif !important;
        }

        .brand-logo {
          font-weight: 700 !important;
          font-size: 1.25rem !important;
          color: #111827 !important;
          letter-spacing: -0.02em !important;
          transition: color 0.2s ease !important;
        }

        .brand-logo:hover {
          color: #4f46e5 !important;
          background: transparent !important;
        }

        .brand-icon {
          color: #4f46e5 !important;
          margin-right: 8px !important;
        }

        .nav-link {
          font-weight: 500 !important;
          color: #4b5563 !important;
          font-size: 1rem !important;
          transition: all 0.2s ease !important;
          border-radius: 8px !important;
          margin: 4px !important;
        }

        .nav-link:hover {
          color: #111827 !important;
          background-color: #f3f4f6 !important;
        }

        .create-link {
          color: #4f46e5 !important;
          font-weight: 600 !important;
          background-color: #e0e7ff !important;
          border: 1px solid #c7d2fe !important;
        }

        .create-link:hover {
          background-color: #c7d2fe !important;
          color: #4338ca !important;
        }

        /* Styling for the new Auth Button */
        .auth-btn {
          background-color: #111827 !important;
          color: #ffffff !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }

        .auth-btn:hover {
          background-color: #374151 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default Header;