'use client';

import { useRouter } from 'next/navigation';
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

interface Cluster {
  cluster_name: string;
  instance_type: string;
  launched_at: string;
  status: string;
  user_id: string;
  region: string;
  gpu: boolean;
  cpu: boolean;
  users?: ClusterUser[];
}

interface ClusterUser {
  full_name: string;
  email: string;
  password: string;
  created_at: string;
}

export default function ClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function fetchClusters() {
      try {
        const res = await fetch('/api/clusters/running');
        const data = await res.json();
        setClusters(data.clusters || []);
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
        setIsDeleteConfirmOpen(false);
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

  const handleAddUser = async () => {
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
              users: cluster.users ? [...cluster.users, newUser] : [newUser],
            }
          : cluster
      )
    );

    setIsAddUserOpen(false);
    setFullName('');
    setEmail('');
    setPassword('');
  };

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
          placeholder="Search by title or name..."
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
                    cluster.status === 'running'
                      ? 'bg-green-100 text-green-700'
                      : cluster.status === 'deploying'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cluster.status}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div className="text-gray-600">🔹 {cluster.cluster_name}</div>
                <div className="text-gray-600">➡️ {cluster.instance_type}</div>
                <div className="text-gray-600">
                  🕒 Created {new Date(cluster.launched_at).toLocaleDateString()}
                </div>
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
                    setSelectedCluster(cluster);
                    setIsDeleteConfirmOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manage Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Cluster: {selectedCluster?.cluster_name}</DialogTitle>
            <DialogDescription>
              Instance: {selectedCluster?.instance_type} | Region: {selectedCluster?.region}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Status: <strong>{selectedCluster?.status}</strong></p>
            <p>Launched at: {new Date(selectedCluster?.launched_at || '').toLocaleString()}</p>
            <p>GPU: {selectedCluster?.gpu ? 'Yes' : 'No'} | CPU: {selectedCluster?.cpu ? 'Yes' : 'No'}</p>
          </div>
          {selectedCluster?.users && (
            <div className="pt-4">
              <h3 className="font-semibold text-sm mb-2">Users</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {selectedCluster.users.map((user, idx) => (
                  <li key={idx}>{user.full_name} ({user.email})</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Cluster</DialogTitle>
            <DialogDescription>
              Add a new user to <strong>{selectedCluster?.cluster_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="text"
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

      {/* Confirm Delete Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Termination</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate{' '}
              <strong>{selectedCluster?.cluster_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCluster && handleDelete(selectedCluster.cluster_name)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Terminating...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
