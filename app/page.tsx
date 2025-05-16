"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export default function DeployCluster() {
  const [clusterName, setClusterName] = useState("");
  const [subdomainName, setSubdomainName] = useState("");
  const [ec2InstanceName, setEc2InstanceName] = useState("");
  //const [cpuEnabled, setCpuEnabled] = useState(true); // default enabled
  const [gpuEnabled, setGpuEnabled] = useState(false);
  const [cpuInstanceType, setCpuInstanceType] = useState("t3a.large"); // default value
  const [gpuInstanceType, setGpuInstanceType] = useState("g4dn.xlarge");
  const [diskSize, setDiskSize] = useState("100");
  const [dbClass, setDbClass] = useState("db.t4g.micro");
  const [clusterRegion, setClusterRegion] = useState("us-east-1");
  const [s3BucketName, setS3BucketName] = useState("aifactory-tf");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [clusterNameError, setClusterNameError] = useState("");
  const [subdomainError, setSubdomainError] = useState("");
  const [ec2NameError, setEc2NameError] = useState("");

  type ClusterDeployPayload = {
    cluster_name: string;
    ec2_name: string;
    subdomain_name: string;
    enable_cpu_image: boolean;
    enable_gpu_image: boolean;
    cluster_region: string;
    s3_bucket_name: string;
    disk_size: string;
    db_class: string;
    cpu_instance_type?: string;
    gpu_instance_type?: string;
  };

  const validateName = (name: string, label: string, allowUnderscore = false): string => {
    if (!name) return `${label} is required.`;
    if (/\s/.test(name)) return `${label} cannot contain spaces.`;
    if (!allowUnderscore && /_/.test(name)) return `${label} cannot contain underscores (_).`;
    if (name.length < 1 || name.length > 19) return `${label} must be 1–19 characters long.`;
    return "";
  };

  const handleDeploy = async () => {
    setClusterNameError("");
    setSubdomainError("");
    setEc2NameError("");
  
    const clusterError = validateName(clusterName, "Cluster Name");
    const ec2Error = validateName(ec2InstanceName, "EC2 Instance Name", true); // allow underscores
  
    if (clusterError) setClusterNameError(clusterError);
    if (ec2Error) setEc2NameError(ec2Error);
  
    const expectedSubdomain = `platform-${clusterName}.attainx-aifactory.com`;
    if (subdomainName !== expectedSubdomain) {
      setSubdomainError(`Subdomain must be exactly: ${expectedSubdomain}`);
    }
  
    if (clusterError || ec2Error || subdomainName !== expectedSubdomain) return;
  
    const payload: ClusterDeployPayload = {
      cluster_name: clusterName,
      ec2_name: ec2InstanceName,
      subdomain_name: subdomainName,
      enable_cpu_image: cpuEnabled,
      enable_gpu_image: gpuEnabled,
      cluster_region: clusterRegion,
      s3_bucket_name: s3BucketName,
      disk_size: diskSize,
      db_class: dbClass,
      ...(cpuEnabled && { cpu_instance_type: cpuInstanceType }),
      ...(gpuEnabled && { gpu_instance_type: gpuInstanceType }),
    };
    
  
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
            {/* Cluster Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">
                Cluster Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="my-ai-cluster"
                className={`bg-white border ${clusterNameError ? "border-red-500" : "border-[#BFBBBF]"}`}
                value={clusterName}
                onChange={(e) => {
                  const name = e.target.value;
                  setClusterName(name);
                  const error = validateName(name, "Cluster Name");
                  setClusterNameError(error);
                  if (!error) {
                    const generatedSubdomain = `platform-${name}.attainx-aifactory.com`;
                    setSubdomainName(generatedSubdomain);
                    setSubdomainError("");
                  }
                }}
              />
              {clusterNameError && (
                <p className="text-red-600 text-sm mt-1">{clusterNameError}</p>
              )}
            </div>

            {/* EC2 Instance Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">
                EC2  Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="AIFlexDeployCluster"
                className={`bg-white border ${ec2NameError ? "border-red-500" : "border-[#BFBBBF]"}`}
                value={ec2InstanceName}
                onChange={(e) => {
                  const name = e.target.value;
                  setEc2InstanceName(name);
                  const error = validateName(name, "EC2 Instance Name", true);
                  setEc2NameError(error);
                }}
              />
              {ec2NameError && (
                <p className="text-red-600 text-sm mt-1">{ec2NameError}</p>
              )}
            </div>

            {/* CPU Instance */}
            <div>
                <label className="block text-sm font-medium mb-1 text-[#233A77]">
                  CPU Instance Type <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="t2.medium"
                  className="bg-white border-[#BFBBBF]"
                  value={cpuInstanceType}
                  onChange={(e) => setCpuInstanceType(e.target.value)}
                />
              </div>

            {/* GPU Instance */}
            <div>
              <label className="inline-flex items-center space-x-2 text-[#233A77]">
                <Checkbox checked={gpuEnabled} onCheckedChange={(checked) => setGpuEnabled(!!checked)} />
                <span>Enable GPU Instance</span>
              </label>
              {gpuEnabled && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1 text-[#233A77]">GPU Instance Type</label>
                  <Input
                    placeholder="g4dn.xlarge"
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

        {/* Subdomain & Advanced Settings */}
        <Card className="bg-[#C0CEE6]">
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#233A77]">
                Subdomain Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="e.g., platform-ai-flex.attainx-aifactory.com"
                className={`bg-white border ${subdomainError ? "border-red-500" : "border-[#BFBBBF]"}`}
                value={subdomainName}
                readOnly
              />
              {subdomainError && (
                <p className="text-red-600 text-sm mt-1">{subdomainError}</p>
              )}
              <p className="text-xs mt-1 text-[#595959]">
                Format: <strong>platform-&lt;cluster_name&gt;.attainx-aifactory.com</strong> (Auto-generated)
              </p>
            </div>

            {/* Advanced Config */}
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
                      placeholder="db.t4g.micro"
                      className="bg-white border-[#BFBBBF]"
                      value={dbClass}
                      onChange={(e) => setDbClass(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#233A77]">Cluster Region</label>
                    <Input
                      placeholder="us-east-1"
                      className="bg-white border-[#BFBBBF]"
                      value={clusterRegion}
                      onChange={(e) => setClusterRegion(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#233A77]">S3 Bucket Name</label>
                    <Input
                      placeholder="aifactory-tf"
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
