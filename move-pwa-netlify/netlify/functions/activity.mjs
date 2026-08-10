import { json, getUser, putUser } from './_shared.mjs';

export default async (req)=>{
  if(req.method!=='POST') return json({error:'POST required'},405);
  const {userId,lastLogAt}=await req.json();
  if(!userId) return json({error:'Missing userId'},400);
  const user=(await getUser(userId))||{userId};
  user.lastLogAt=lastLogAt||new Date().toISOString();
  user.updatedAt=new Date().toISOString();
  await putUser(userId,user);
  return json({ok:true});
};
