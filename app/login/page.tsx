"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#233A77] via-[#1E2E5A] to-[#C51E26]">
      <Card className="w-full max-w-md shadow-xl bg-[#F9F9F9] rounded-2xl border-none">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <img src="/attainxname.svg" alt="AttainX Logo" className="w-28 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-[#233A77]">Welcome to AI Factory</h2>
            <p className="text-sm text-[#595959]">Sign in to continue</p>
          </div>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#233A77]">
                Email
              </label>
              <Input
                type="email"
                id="email"
                className="mt-1 bg-white border border-[#BFBBBB] text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#233A77]">
                Password
              </label>
              <Input
                type="password"
                id="password"
                className="mt-1 bg-white border border-[#BFBBBB] text-sm"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-[#C51E26] hover:bg-[#A3151B] text-white">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
