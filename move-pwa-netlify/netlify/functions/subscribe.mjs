import { json, getUser, putUser } from './_shared.mjs';

export default async (req)=>{
  if(req.method!=='POST') return json({error:'POST required'},405);
  const body=await req.json();
  if(!body.userId || !body.subscription || !body.timeZone) return json({error:'Missing fields'},400);

  const prior=(await getUser(body.userId))||{};
  await putUser(body.userId,{
    ...prior,
    userId:body.userId,
    subscription:body.subscription,
    timeZone:body.timeZone,
    createdAt:prior.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });

  // Keep an index because Blob stores are key/value and we want a tiny prototype.
  const { store } = await import('./_shared.mjs');
  const s=store();
  const ids=(await s.get('user-index',{type:'json'}))||[];
  if(!ids.includes(body.userId)){
    ids.push(body.userId);
    await s.setJSON('user-index',ids);
  }
  return json({ok:true});
};
