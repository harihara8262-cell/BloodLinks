import React from "react";
import { motion } from "framer-motion";

const AnimatedButton = ({ children, className = "", ...rest }) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
