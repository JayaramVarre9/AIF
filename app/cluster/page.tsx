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
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
interface ClusterUser {
  full_name: string;
  email: string;
  password: string;
  created_at: string;
}

interface Cluster {
  cluster_name: string;
  launched_at: string;
  status: string;
  version: string;
  region: string;
  users: ClusterUser[];
  endpoint: string;
  cpu: string;
  gpu: string;
}

export default function ClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteCluster, setPendingDeleteCluster] = useState<Cluster | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function fetchClusters() {
      try {
        const res = await fetch('/api/clusters/running');
        const data = await res.json();
        console.log('Fetched Data:', data);
        

        const clustersList = Array.isArray(data) ? data : data.clusters || [];

        const parsedClusters: Cluster[] = clustersList.map((item: Partial<Cluster>) => ({
            cluster_name: item.cluster_name || '',
            launched_at: item.launched_at ? item.launched_at.replace(' ', 'T') : '',
            status: item.status || 'unknown',
            version: item.version || '',
            endpoint: item.endpoint || '',
            cpu: item.cpu || '',
            gpu: item.gpu || '',
            region: item.region || '',
            users: [],
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

  const handleAddUser = () => {
    if (!selectedCluster) return;

    const newUser: ClusterUser = {
      full_name: fullName,
      email,
      password,
      created_at: new Date().toISOString(),
    };

    setClusters((prev) =>
      prev.map((cluster) =>
        cluster.cluster_name === selectedCluster.cluster_name
          ? {
              ...cluster,
              users: [...(cluster.users || []), newUser],
            }
          : cluster
      )
    );

    setIsAddUserOpen(false);
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const handleDelete = async (name: string) => {
    try {
      const res = await fetch(`/api/clusters/running?name=${name}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setClusters((prev) => prev.filter((c) => c.cluster_name !== name));
        setConfirmDeleteOpen(false);
      } else {
        console.error('Failed to delete cluster');
      }
    } catch (error) {
      console.error('Error deleting cluster:', error);
    }
  };
  const router = useRouter();
  return (
    <div className="px-4 sm:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Active Clusters</h1>
        <Button onClick={() => router.push('/')}>
          Deploy New Cluster
        </Button>
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



         {/*<pre className="bg-gray-100 text-sm p-4">  //******Debugger *******
                {JSON.stringify(clusters, null, 2)}
         </pre>*/}
      
      
      
      
      {filteredClusters.length === 0 ? (
  <p className="text-gray-500 text-center mt-8">No clusters are currently running.</p>
) : (
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
                <div className="text-gray-600">🕒 Created: {typeof window !== 'undefined' && new Date(cluster.launched_at).toLocaleDateString()}</div>
                <div className="text-gray-600">💻 CPU: {cluster.cpu || 'N/A'}</div> 
                <div className="text-gray-600">🎮 GPU: {cluster.gpu || 'N/A'}</div>
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
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCluster(cluster);
                    setIsAddUserOpen(true);
                  }}
                >
                  Add User
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setPendingDeleteCluster(cluster);
                    setConfirmDeleteOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}

      {/* Manage Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Cluster: {selectedCluster?.cluster_name}</DialogTitle>
            <DialogDescription>Version: {selectedCluster?.version}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Status: <strong>{selectedCluster?.status || 'Unknown'}</strong></p>

            <p>Launched at:{' '}
                 {typeof window !== 'undefined' && selectedCluster?.launched_at
                 ? new Date(selectedCluster.launched_at).toLocaleDateString()
                 : 'N/A'}
            </p>

             <p>Endpoint: {selectedCluster?.endpoint || 'N/A'}</p>
             <p>CPU Nodes Present: {selectedCluster?.cpu || 'N/A'}</p>
            <p>GPU Nodes Present: {selectedCluster?.gpu || 'N/A'}</p>

            {selectedCluster && selectedCluster.users && selectedCluster.users.length > 0 && (
  <>
            <h3 className="pt-4 font-semibold">Users</h3>
            <ul className="list-disc pl-5">
            {selectedCluster.users.map((user, idx) => (
                <li key={idx}>
                {user.full_name} ({user.email})
                </li>
            ))}
            </ul>
        </>
        )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to {selectedCluster?.cluster_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddUser}>Add User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{pendingDeleteCluster?.cluster_name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDeleteCluster) {
                  handleDelete(pendingDeleteCluster.cluster_name);
                }
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
