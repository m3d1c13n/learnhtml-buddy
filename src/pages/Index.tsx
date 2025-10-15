import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const mode = localStorage.getItem("userMode");
    if (mode === "admin") {
      navigate("/admin");
    } else if (mode === "student") {
      navigate("/student");
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return null;
};

export default Index;
