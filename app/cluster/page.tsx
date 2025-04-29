'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Cluster {
  cluster_name: string;
  launched_at: string;
  status: string;
  version: string;
  region: string,
  users: string,
  endpoint: string;
  cpu: string;
  gpu: string;
  //users?: ClusterUser[];
}

export default function ClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteCluster, setPendingDeleteCluster] = useState<Cluster | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  //const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function fetchClusters() {
      try {
        const res = await fetch('/api/clusters/running');
        const data = await res.json();
        console.log('Fetched Data:', data);

        const clustersList = data.clusters || [];

        const parsedClusters: Cluster[] = clustersList.map((item: any) => ({
          cluster_name: item.cluster_name || '',
          launched_at: item.launched_at ? item.launched_at.replace(' ', 'T') : '',
          status: item.status || 'unknown',
          version: item.version || '',
          endpoint: item.endpoint || '',
          cpu: item.cpu || '',    // ✅ Direct assignment without === 'Yes'
          gpu: item.gpu || '',
          region: item.region || '',
          users: item.users || '', 
        }));

        console.log('Parsed Clusters:', parsedClusters);
        setClusters(parsedClusters);
      } catch (error) {
        console.error('Failed to fetch clusters:', error);
      }
    }

    fetchClusters();
  }, []);

  const filteredClusters = clusters.filter((cluster) =>
    cluster.cluster_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (name: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clusters/running?name=${name}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setClusters((prev) => prev.filter((c) => c.cluster_name !== name));
        setIsDialogOpen(false);
        setSelectedCluster(null);
      } else {
        console.error('Failed to delete cluster');
      }
    } catch (error) {
      console.error('Error deleting cluster:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Active Clusters</h1>
        <Button>Deploy New Cluster</Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by cluster name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClusters.map((cluster, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{cluster.cluster_name}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    cluster.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {cluster.status}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div className="text-gray-600">🔹 Region: {cluster.region}</div>
                <div className="text-gray-600">🕒 Created: {new Date(cluster.launched_at).toLocaleDateString()}</div>
                <div className="text-gray-600">💻 CPU: {cluster.cpu}</div> 
                <div className="text-gray-600">🎮 GPU: {cluster.gpu}</div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCluster(cluster);
                    setIsDialogOpen(true);
                  }}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Cluster: {selectedCluster?.cluster_name}</DialogTitle>
            <DialogDescription>
              Version: {selectedCluster?.version}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Status: <strong>{selectedCluster?.status}</strong></p>
            <p>Launched at: {new Date(selectedCluster?.launched_at || '').toLocaleString()}</p>
            <p>Endpoint: {selectedCluster?.endpoint}</p>
            <p>CPU Nodes Present: {selectedCluster?.cpu}</p>
            <p>GPU Nodes Present: {selectedCluster?.gpu}</p>
            <p>Cognito Users: {selectedCluster?.users}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
