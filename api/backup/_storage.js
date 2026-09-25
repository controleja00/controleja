const PRIVATE_PREFIX = "private://";

export const toBackupPath = (bucket, sourcePath) => {
  const cleanBucket = String(bucket || "").replace(/^\/+|\/+$/g, "");
  const cleanPath = String(sourcePath || "").replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath || cleanPath.includes("..")) {
    throw new Error("Caminho de backup invalido.");
  }
  return `supabase-storage/${cleanBucket}/${cleanPath}`;
};

export const storagePathFromUrl = (storedUrl) => {
  if (!String(storedUrl || "").startsWith(PRIVATE_PREFIX)) return "";
  return storedUrl.slice(PRIVATE_PREFIX.length).replace(/^\/+/, "");
};

export const isStorageFile = (item) => Boolean(item?.id || item?.metadata);

