"use client";

import { useState, useEffect } from "react";
import PolaroidGenerator from "@/components/polaroid-generator";

export default function GeneratePage() {
  const [userCredit, setUserCredit] = useState(100); // 模拟数据

  const handleCreditUpdate = (newCredit: number) => {
    setUserCredit(newCredit);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PolaroidGenerator 
        userCredit={userCredit}
        onCreditUpdate={handleCreditUpdate}
      />
    </div>
  );
}