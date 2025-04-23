"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const cpuTypes = ["t2.micro", "t2.medium", "t2.large"];
const gpuTypes = ["NVIDIA T4", "NVIDIA A100", "NVIDIA V100"];

export default function DeployCluster() {
  const [cpuEnabled, setCpuEnabled] = useState(false);
  const [gpuEnabled, setGpuEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#E7E6E6] text-black p-6">
      <h1 className="text-4xl font-bold mb-8 text-[#233A77]">Deploy New Cluster</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#C0CEE6]">
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">Cluster Name</label>
              <Input placeholder="my-ai-cluster" className="bg-white border-[#BFBBBF]" />
            </div>

            <div>
        <label className="inline-flex items-center space-x-2 text-[#233A77]">
          <Checkbox onCheckedChange={(checked) => setCpuEnabled(!!checked)} />
          <span>Enable CPU Instance</span>
        </label>
        {cpuEnabled && (
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1 text-[#233A77]">
              CPU Instance Type
            </label>
            <Select defaultValue="" className="bg-white border-[#BFBBBF]">
              <SelectItem value="" disabled>Select CPU instance type</SelectItem>
              {cpuTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </Select>
          </div>
        )}
      </div>

            <div>
              <label className="inline-flex items-center space-x-2 text-[#233A77]">
                <Checkbox onCheckedChange={setGpuEnabled} />
                <span>Enable GPU Instance</span>
              </label>
              {gpuEnabled && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1 text-[#233A77]">GPU Instance Type</label>
                  <Select defaultValue="" className="bg-white border-[#BFBBBF]">
                    <SelectItem value="" disabled>Select GPU instance type</SelectItem>
                    {gpuTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button className="w-full bg-[#C51E26] text-white hover:bg-[#A3151B]">Deploy Cluster</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#C0CEE6]">
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">Subdomain Name</label>
              <Input placeholder="my-cluster" className="bg-white border-[#BFBBBF]" />
              <p className="text-xs mt-1 text-[#595959]">
                Your cluster will be available at <strong>subdomain.aifactory.attainx.com</strong>
              </p>
            </div>

            <div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-[#233A77]">Advanced Configuration</summary>
                <div className="mt-2 text-sm text-[#595959]">
                  (Optional) Add extra configuration settings here.
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
