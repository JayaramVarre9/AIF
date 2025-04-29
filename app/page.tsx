"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export default function DeployCluster() {
  const [clusterName, setClusterName] = useState("");
  const [subdomainName, setSubdomainName] = useState("");
  const [cpuEnabled, setCpuEnabled] = useState(false);
  const [gpuEnabled, setGpuEnabled] = useState(false);
  const [cpuInstanceType, setCpuInstanceType] = useState("");
  const [gpuInstanceType, setGpuInstanceType] = useState("");
  const [diskSize, setDiskSize] = useState("");
  const [dbClass, setDbClass] = useState("");
  const [clusterRegion, setClusterRegion] = useState("");
  const [s3BucketName, setS3BucketName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDeploy = async () => {
    if (!clusterName || !subdomainName) {
      alert(
        `Missing required fields:\n${!clusterName ? "- Cluster Name\n" : ""}${!subdomainName ? "- Subdomain Name" : ""}`
      );
      return;
    }

    const payload: any = {
      cluster_name: clusterName,
      subdomain_name: subdomainName,
    };

    if (cpuEnabled) {
      payload.cpu_instance_type = cpuInstanceType;
    }
    if (gpuEnabled) {
      payload.enable_gpu_instance = true;
      payload.gpu_instance_type = gpuInstanceType;
    }
    if (diskSize) payload.disk_size = diskSize;
    if (dbClass) payload.db_class = dbClass;
    if (clusterRegion) payload.cluster_region = clusterRegion;
    if (s3BucketName) payload.s3_bucket_name = s3BucketName;

    try {
      const res = await fetch("/api/clusters/deploy", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        alert("Cluster deployment initiated successfully!");
      } else {
        alert(`Deployment failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deploying:", err);
      alert("Deployment failed due to network/server error.");
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E6E6] text-black p-6">
      <h1 className="text-4xl font-bold mb-8 text-[#233A77]">Deploy New Cluster</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#C0CEE6]">
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">Cluster Name</label>
              <Input
                placeholder="my-ai-cluster"
                className="bg-white border-[#BFBBBF]"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
              />
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
                  <Input
                    placeholder="e.g., t2.medium"
                    className="bg-white border-[#BFBBBF]"
                    value={cpuInstanceType}
                    onChange={(e) => setCpuInstanceType(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="inline-flex items-center space-x-2 text-[#233A77]">
                <Checkbox onCheckedChange={(checked) => setGpuEnabled(!!checked)} />
                <span>Enable GPU Instance</span>
              </label>
              {gpuEnabled && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1 text-[#233A77]">GPU Instance Type</label>
                  <Input
                    placeholder="e.g., g4dn.xlarge"
                    className="bg-white border-[#BFBBBF]"
                    value={gpuInstanceType}
                    onChange={(e) => setGpuInstanceType(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button onClick={handleDeploy} className="w-full bg-[#C51E26] text-white hover:bg-[#A3151B]">
                Deploy Cluster
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#C0CEE6]">
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">Subdomain Name</label>
              <Input
                placeholder="my-cluster"
                className="bg-white border-[#BFBBBF]"
                value={subdomainName}
                onChange={(e) => setSubdomainName(e.target.value)}
              />
              <p className="text-xs mt-1 text-[#595959]">
                Your cluster will be available at <strong>subdomain.aifactory.attainx.com</strong>
              </p>
            </div>

            <div>
              <details className="mt-4" open={showAdvanced}>
                <summary
                  className="cursor-pointer text-sm font-semibold text-[#233A77]"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  Advanced Configuration
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#233A77]">Disk Size (GB)</label>
                    <Input
                      placeholder="100"
                      className="bg-white border-[#BFBBBF]"
                      value={diskSize}
                      onChange={(e) => setDiskSize(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#233A77]">DB Class</label>
                    <Input
                      placeholder="e.g., db.t4g.micro"
                      className="bg-white border-[#BFBBBF]"
                      value={dbClass}
                      onChange={(e) => setDbClass(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#233A77]">Cluster Region</label>
                    <Input
                      placeholder="e.g., us-east-1"
                      className="bg-white border-[#BFBBBF]"
                      value={clusterRegion}
                      onChange={(e) => setClusterRegion(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#233A77]">S3 Bucket Name</label>
                    <Input
                      placeholder="my-cluster-data"
                      className="bg-white border-[#BFBBBF]"
                      value={s3BucketName}
                      onChange={(e) => setS3BucketName(e.target.value)}
                    />
                  </div>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
