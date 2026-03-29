import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const PageTransition = ({ children }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="route-stage"
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 14, scale: 0.992 }
      }
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -10, scale: 0.996 }
      }
      transition={
        reduceMotion
          ? { duration: 0.16, ease: "easeOut" }
          : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
