import { useCheckAdminQuery } from "@/store/services/adminApi";
import { use, useEffect } from "react";
import { useNavigate } from "react-router";
import Spinner from "./ui/spinner";

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate();
  // const isAdmin = localStorage.getItem("bookingCabsAdmin") ? true : false;
  const { isLoading, isError } = useCheckAdminQuery(null, {
    skip: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (authentication && isError) {
        navigate("/login");
      } else if (!authentication && !isError) {
        navigate("/dashboard");
      }
    }
  }, [isLoading, isError, authentication, navigate]);

  // useEffect(() => {
  //   const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  //   const isSmallScreen = window.innerWidth < 1024;

  //   if (isMobile || isSmallScreen) {
  //     document.body.innerHTML = `
  //     <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;">
  //       <h2>This website is only available on desktop.</h2>
  //       <p>Please open it on a larger screen.</p>
  //     </div>
  //   `;
  //   }
  // }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-4">
        <Spinner />
      </div>
    );
  }

  // ✅ only render after auth check is done
  if ((authentication && isError) || (!authentication && !isError)) {
    return null; // avoid flash of protected page
  }

  return <>{children}</>;
}
