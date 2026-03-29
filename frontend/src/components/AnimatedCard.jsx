import React from "react";
import { motion } from "framer-motion";

const AnimatedCard = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 24, delay }}
      whileHover={{ y: -5, rotateX: 2, rotateY: -2, boxShadow: "0 22px 48px rgba(15, 23, 42, 0.2)" }}
      className={`surface-3d ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
