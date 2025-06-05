// app/utils/clusterMap.ts

//const STORAGE_KEY = "clusterInstanceMap";
const TEMP_CLUSTER_KEY = "pendingCluster";

export function storePendingCluster(clusterName: string) {
  localStorage.setItem(TEMP_CLUSTER_KEY, clusterName);
}

/*export function saveInstanceMapping(instanceId: string) {
  const clusterName = localStorage.getItem(TEMP_CLUSTER_KEY);
  if (!clusterName) return;

  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  existing[clusterName] = instanceId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  localStorage.removeItem(TEMP_CLUSTER_KEY);
}

export function getInstanceIdByCluster(clusterName: string): string | null {
  const map = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return map[clusterName] || null;
}*/

export function deleteClusterMapping(clusterName: string) {
  /*const map = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  delete map[clusterName];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));*/

  localStorage.removeItem(TEMP_CLUSTER_KEY);
}
