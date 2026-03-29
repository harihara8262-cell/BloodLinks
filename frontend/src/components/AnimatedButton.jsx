import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const AnimatedButton = ({ className = "", children, ...props }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={reduceMotion ? { scale: 1.01 } : { y: -1, scale: 1.01 }}
      whileTap={reduceMotion ? { scale: 0.99 } : { scale: 0.985, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.58 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
