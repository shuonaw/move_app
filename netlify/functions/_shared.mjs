import { getStore } from '@netlify/blobs';

export const store = () => getStore('move-push');

export function json(body,status=200){
  return new Response(JSON.stringify(body),{
    status,
    headers:{'content-type':'application/json','cache-control':'no-store'}
  });
}

export async function getUser(userId){
  return await store().get(`user:${userId}`,{type:'json'});
}

export async function putUser(userId,data){
  await store().setJSON(`user:${userId}`,data);
}
