import Image from "next/image";
import React from "react";

export default function AttainxLogo() {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "6px 8px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {/* Logo Icon */}
      <Image
        src="/attainxlogo.svg"
        alt="AttainX Logo"
        width={32}
        height={62}
      />

      {/* Logo Name */}
     {/*} <Image
        src="/attainxname.svg"
        alt="AttainX Name"
        width={500}
        height={100}
      />*/}
    </div>
  );
}
