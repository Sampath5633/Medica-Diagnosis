import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("https://medica-backend-3.onrender.com/api/register", {
        email,
        password,
      });

      setMessage(res.data.message);
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
      setMessage("");
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .register-container {
            width: 95% !important;
            max-width: 380px !important;
            padding: 20px !important;
            margin: 10px !important;
          }
          
          .register-heading {
            font-size: 24px !important;
            margin-bottom: 16px !important;
          }
          
          .register-input {
            padding: 14px !important;
            font-size: 16px !important;
            margin-bottom: 14px !important;
          }
          
          .register-button {
            padding: 14px !important;
            font-size: 16px !important;
            min-height: 48px !important;
          }
          
          .register-message {
            font-size: 14px !important;
            margin-top: 12px !important;
          }
          
          .register-login-link {
            font-size: 14px !important;
            margin-top: 12px !important;
          }
          
          .register-center-container {
            padding: 15px !important;
          }
        }
        
        @media (max-width: 480px) {
          .register-container {
            width: 100% !important;
            max-width: 340px !important;
            padding: 16px !important;
            margin: 5px !important;
          }
          
          .register-heading {
            font-size: 22px !important;
            margin-bottom: 14px !important;
          }
          
          .register-input {
            padding: 12px !important;
            font-size: 16px !important;
          }
          
          .register-button {
            padding: 12px !important;
            font-size: 15px !important;
            min-height: 44px !important;
          }
          
          .register-center-container {
            padding: 10px !important;
          }
        }
        
        @media (min-width: 769px) {
          .register-container {
            width: 100% !important;
            max-width: 420px !important;
            padding: 30px !important;
          }
          
          .register-heading {
            font-size: 28px !important;
            margin-bottom: 20px !important;
          }
          
          .register-input {
            padding: 12px !important;
            font-size: 14px !important;
          }
          
          .register-button {
            padding: 12px !important;
            font-size: 14px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .register-container {
            max-width: 450px !important;
            padding: 35px !important;
          }
          
          .register-heading {
            font-size: 30px !important;
            margin-bottom: 24px !important;
          }
        }
        
        /* Fix for iOS Safari zoom on input focus */
        @media (max-width: 768px) {
          .register-input:focus {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div style={styles.fullPageBackground}>
        <div style={styles.overlay}></div>
        <div style={styles.centerContainer} className="register-center-container">
          <div style={styles.container} className="register-container">
            <h2 style={styles.heading} className="register-heading">Create a Medical Account</h2>
            <form onSubmit={handleRegister} style={styles.form}>
              <input
                ref={emailInputRef}
                type="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                className="register-input"
                style={{
                  ...styles.input,
                  ...(focusedInput === "email" ? styles.inputFocus : {}),
                }}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                className="register-input"
                style={{
                  ...styles.input,
                  ...(focusedInput === "password" ? styles.inputFocus : {}),
                }}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                onChange={handleChange}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => setFocusedInput(null)}
                className="register-input"
                style={{
                  ...styles.input,
                  ...(focusedInput === "confirmPassword"
                    ? styles.inputFocus
                    : {}),
                }}
              />
              <button
                type="submit"
                className="register-button"
                style={{
                  ...styles.button,
                  ...(isHovering ? styles.buttonHover : {}),
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Register
              </button>
            </form>

            {message && <p style={styles.message} className="register-message">{message}</p>}
            {error && <p style={styles.error} className="register-message">{error}</p>}

            <p style={styles.loginLink} className="register-login-link">
              Already have an account?{" "}
              <a href="/login" style={styles.loginLinkAnchor}>
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// 💠 Responsive Styles
const styles: { [key: string]: React.CSSProperties } = {
  fullPageBackground: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    backgroundImage:
      "url('https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "auto",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(to right, rgba(0, 36, 80, 0.6), rgba(0, 85, 150, 0.5))",
    zIndex: 1,
  },
  centerContainer: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 8px 20px rgba(0, 183, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxSizing: "border-box",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Segoe UI, sans-serif",
    lineHeight: "1.2",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(0, 229, 255, 0.5)",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    transition: "all 0.3s ease",
    boxShadow: "inset 0 0 4px rgba(0,229,255,0.2)",
    boxSizing: "border-box",
    width: "100%",
  },
  inputFocus: {
    border: "1px solid #00e5ff",
    boxShadow: "0 0 8px #00e5ff, 0 0 16px rgba(0,229,255,0.4)",
  },
  button: {
    padding: "12px",
    background: "transparent",
    color: "#ffffff",
    border: "2px solid #00e5ff",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 0 8px rgba(0, 229, 255, 0.2)",
    boxSizing: "border-box",
    width: "100%",
    minHeight: "auto",
  },
  buttonHover: {
    background:
      "linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,172,193,0.2))",
    boxShadow: "0 0 12px #00e5ff, 0 0 24px #00acc1",
    transform: "scale(1.03)",
  },
  message: {
    color: "#0f0",
    marginTop: "10px",
    textAlign: "center",
    fontSize: "14px",
  },
  error: {
    color: "#f55",
    marginTop: "10px",
    textAlign: "center",
    fontSize: "14px",
  },
  loginLink: {
    textAlign: "center",
    marginTop: "10px",
    color: "#fff",
    fontSize: "14px",
  },
  loginLinkAnchor: {
    color: "#00e5ff",
    textDecoration: "none",
  },
};

export default Register;