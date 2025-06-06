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
import { deleteClusterMapping } from '@/app/utils/clusterMap';


interface ClusterUser {
  Username: string;
  Email: string;
  EmailVerified: string;
  ConfirmationStatus: string;
  Status: string
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

interface RawCluster {
  cluster_name?: string;
  launched_at?: string;
  status?: string;
  version?: string;
  endpoint?: string;
  cpu?: string;
  gpu?: string;
  region?: string;
  users?: ClusterUser[];
}

interface LogEntry {
  message: string;
  [key: string]: any;
}

export default function ClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
const [successMessage, setSuccessMessage] = useState('');

const [showPassword, setShowPassword] = useState(false);
const [passwordError, setPasswordError] = useState('');

const [instanceId, setInstanceId] = useState<string | null>(null);

const [deployStatus, setDeployStatus] = useState<Record<string, number>>({});

const [instanceToggle, setInstanceToggle] = useState<Record<string, boolean>>({});


  useEffect(() => {
    async function fetchClusters() {
      try {
        //localStorage.removeItem("instance_id");
        //localStorage.clear();
        const res = await fetch('/api/clusters/running');
        const data = await res.json();
        const clustersList = data.clusters || [];

        const parsedClusters: Cluster[] = clustersList.map((item: RawCluster) => ({
          cluster_name: item.cluster_name || '',
          launched_at: item.launched_at ? item.launched_at.replace(' ', 'T') : '',
          status: item.status || 'unknown',
          version: item.version || '',
          endpoint: item.endpoint || '',
          cpu: item.cpu || '',
          gpu: item.gpu || '',
          region: item.region || '',
          users: item.users || [],
        }));

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

  async function fetchDeployStatus(cluster_name: string) {
  try {
    const res = await fetch(`/api/logs?log_stream_name=${cluster_name}&log_type=deploy`);
    if (!res.ok) return;

    const data = await res.json();
    const logs: string[] = (data.logs as LogEntry[]).map((log) => log.message).reverse(); // newest last

    for (const message of logs) {
      if (message.includes("PLAY RECAP") && message.includes("failed=")) {
        const match = message.match(/failed=(\d+)/);
        if (match) {
          const failed = parseInt(match[1]);
          setDeployStatus(prev => ({ ...prev, [cluster_name]: failed }));
          return;
        }
      }
    }

    // Default if no PLAY RECAP found
    setDeployStatus(prev => ({ ...prev, [cluster_name]: -1 }));
  } catch (error) {
    console.error(`Error fetching deploy status for ${cluster_name}`, error);
    setDeployStatus(prev => ({ ...prev, [cluster_name]: -1 }));
  }
}

useEffect(() => {
  clusters.forEach(cluster => {
    fetchDeployStatus(cluster.cluster_name);
  });
}, [clusters]);

  useEffect(() => {
  async function fetchInstanceId() {
    if (!selectedCluster?.cluster_name) return;
    try {
      const res = await fetch(`/api/instance-map/get?cluster_name=${selectedCluster.cluster_name}`);
      if (res.ok) {
        const data = await res.json();
        setInstanceId(data.instance_id);
        setInstanceToggle(prev => ({
  ...prev,
  [selectedCluster.cluster_name]: !!data.instance_id,
}));
      } else {
        setInstanceId(null);
      }
    } catch (error) {
      console.error("Failed to fetch instance ID:", error);
      setInstanceId(null);
    }
  }

  fetchInstanceId();
}, [selectedCluster]);


  const handleAddUser = async () => {
  if (!selectedCluster) return;
  const res = await fetch(`/api/instance-map/get?cluster_name=${selectedCluster.cluster_name}`);
    if (!res.ok) {
      console.error("Failed to fetch instance ID");
      return;
    }
    const data = await res.json();
    const instanceId = data.instance_id; 
   if (!instanceId) {
  console.error("No instance ID found for", selectedCluster?.cluster_name);
  return;
}
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!passwordRegex.test(password)) {
    setPasswordError(
      'Password must be at least 8 characters and include upper/lowercase letters, a number, and a special character.'
    );
    return;
  }

  setPasswordError('');

  const payload = {
    username,
    email,
    cluster_name: selectedCluster.cluster_name,
    instance_id: instanceId, // replace with static later if needed for testing and comment out the line 102-108
    region: selectedCluster.region,
    temp_password: password,
  };
  console.log("Payload for user Creaion :", payload)
  try {
    setIsLoading(true);
    setSuccessMessage('');

    const res = await fetch('/api/clusters/user_creation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const newUser: ClusterUser = {
        Username: username,
        Email: email,
        EmailVerified: '',
        ConfirmationStatus: '',
        Status: '',
      };

      setClusters((prev) =>
        prev.map((cluster) =>
          cluster.cluster_name === selectedCluster.cluster_name
            ? { ...cluster, users: [...(cluster.users || []), newUser] }
            : cluster
        )
      );

      setSuccessMessage('✅ User added successfully!');
      setUsername('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        setIsAddUserOpen(false);
        setSuccessMessage('');
      }, 2000);
    } else {
      const data = await res.json();
      console.error('Failed to add user:', data);
      setSuccessMessage('❌ Failed to add user.');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    setSuccessMessage('❌ Server error while adding user.');
  } finally {
    setIsLoading(false);
  }
};



 const handleDelete = async () => {
  if (!selectedCluster) {
    console.error("No cluster selected for deletion.");
    return;
  }

  const clusterName = selectedCluster.cluster_name;

  // Fetch instance ID from backend
  let instanceId: string | null = null;
  try {
    const res = await fetch(`/api/instance-map/get?cluster_name=${clusterName}`);
    if (!res.ok) {
      console.error("Failed to fetch instance ID");
      return;
    }
    const data = await res.json();
    instanceId = data.instance_id;
  } catch (err) {
    console.error("Error fetching instance ID:", err);
    return;
  }

  if (!instanceId) {
    console.error("No instance ID found for", clusterName);
    return;
  }

  // Optional: prevent deletion while deploying
  if (selectedCluster.status === 'CREATING') {
    alert("Cluster is still deploying. Please wait until it's ready to delete.");
    return;
  }

  try {
    const res = await fetch("/api/clusters/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instance_id: instanceId,
        cluster_name: clusterName,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("Cluster deleted successfully:", data);
      setSuccessMessage('✅ Cluster Deleted successfully!');

      // Delete mapping
      const mapRes = await fetch(`/api/instance-map/delete?cluster_name=${clusterName}`, {
        method: "DELETE",
      });
      const mapData = await mapRes.json();
      if (mapRes.ok) {
        console.log("ClusterInstance Mapping deleted successfully:", mapData);
      } else {
        console.error("Failed to delete cluster instance mapping:", mapData);
      }

      deleteClusterMapping(clusterName);

      setClusters((prev) => prev.filter((c) => c.cluster_name !== clusterName));
      setConfirmDeleteOpen(false);
    } else {
      console.error("Failed to delete cluster:", data);
    }
  } catch (err) {
    console.error("Error deleting cluster:", err);
  }
};


  function handleToggleInstance(cluster_name: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="px-4 sm:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Active Clusters</h1>
        <Button onClick={() => router.push('/')}>Deploy New Cluster</Button>
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
                <div className="flex items-center gap-2 pt-2">
  <Label className="text-sm">EC2:</Label>
  <input
    type="checkbox"
    checked={instanceToggle[cluster.cluster_name] ?? true}
    onChange={() => handleToggleInstance(cluster.cluster_name)}
  />
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
                    disabled={deployStatus[cluster.cluster_name] !== 0}
                  >
                    Add User
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedCluster(cluster);
                      setConfirmDeleteOpen(true);
                    }}
                    disabled={deployStatus[cluster.cluster_name] === undefined}
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
            <p>
              Launched at:{' '}
              {typeof window !== 'undefined' && selectedCluster?.launched_at
                ? new Date(selectedCluster.launched_at).toLocaleDateString()
                : 'N/A'}
            </p>
            {/*<p>Endpoint: {selectedCluster?.endpoint || 'N/A'}</p>*/}
            <p>CPU Nodes Present: {selectedCluster?.cpu || 'N/A'}</p>
            <p>GPU Nodes Present: {selectedCluster?.gpu || 'N/A'}</p>
            <p>
              EC2 Instance ID:{" "}
              <strong>{instanceId ?? "Loading..."}</strong>
            </p>


            {selectedCluster && selectedCluster.users && selectedCluster.users.length > 0 && (
              <>
                <h3 className="pt-4 font-semibold">Users</h3>
                <ul className="list-disc pl-5">
                  {selectedCluster.users.map((user, idx) => (
                    <li key={idx}>
                      {user.Username} ({user.Email})
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
        <Label htmlFor="username">User Name</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
  <Label htmlFor="temp_password">Password</Label>
  <div className="flex gap-2 items-center">
    <Input
      id="password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <Button
      type="button"
      variant="outline"
      className="text-xs px-2 py-1"
      onClick={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? 'Hide' : 'Show'}
    </Button>
  </div>
  {passwordError && (
    <p className="text-sm text-red-600 mt-1">{passwordError}</p>
  )}
</div>

      {isLoading && (
        <p className="text-sm text-blue-600">Adding user, please wait...</p>
      )}

      {successMessage && (
  <p className={`text-sm ${successMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
    {successMessage}
  </p>
)}


      <div className="flex justify-end">
        <Button onClick={handleAddUser} disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add User'}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>


      {/* Delete Cluster Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cluster Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cluster? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}