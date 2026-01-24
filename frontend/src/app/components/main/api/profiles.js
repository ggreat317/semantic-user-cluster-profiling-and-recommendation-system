import { API_URL, getIdToken } from "./token";

export async function loadSelfUMAP() {
  const token = await getIdToken();
  
  const res = await fetch(`${API_URL}/profiles/UMAP/self`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get UMAP ${res.status} ${errorText}`);
  }

  return await res.json();
}

export async function loadOtherUMAP(userID) {
  const token = await getIdToken();
  
  const res = await fetch(`${API_URL}/profiles/UMAP/others/${userID}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get UMAP ${res.status} ${errorText}`);
  }

  return await res.json();
}

export async function loadOthers(roomID){
  // code below should be ran through firebase instead, use this if needed for stand stills
  /*
  const token = await getIdToken();

  const res =  await fetch(`${API_URL}/profiles/room/${roomID}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if(!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get profiles ${res.status} ${errorText}`);
  }

  return await res.json();
  */
}
