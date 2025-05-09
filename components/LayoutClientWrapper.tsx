"use client";

import { useEffect } from "react";

// If you're using Amplify V6, but *not actually using Amplify auth*,
// you can safely remove this import unless needed for DataStore or other services
// import { Amplify } from "aws-amplify";
// import amplifyConfig from "@/app/amplifyConfig";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ⚠️ Only configure Amplify if you're using Amplify-based services (not AWS SDK directly)
    // Amplify.configure(amplifyConfig);
  }, []);

  return <>{children}</>;
}
