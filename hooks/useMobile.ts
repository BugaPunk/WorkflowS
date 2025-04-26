import { useState, useEffect } from "preact/hooks";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof globalThis !== "undefined") {
      const checkMobile = () => {
        setIsMobile(globalThis.innerWidth < 768);
      };

      checkMobile();
      globalThis.addEventListener("resize", checkMobile);

      return () => {
        globalThis.removeEventListener("resize", checkMobile);
      };
    }
  }, []);

  return isMobile;
}
