import webpush from 'web-push';
import { json, getUser } from './_shared.mjs';

export default async (req)=>{
  if(req.method!=='POST') return json({error:'POST required'},405);
  const {userId}=await req.json();
  if(!userId) return json({error:'Missing userId'},400);

  const user=await getUser(userId);
  if(!user?.subscription) return json({error:'No push subscription found. Enable reminders first.'},404);

  const pub=Netlify.env.get('VAPID_PUBLIC_KEY');
  const priv=Netlify.env.get('VAPID_PRIVATE_KEY');
  const subject=Netlify.env.get('VAPID_SUBJECT')||'mailto:hello@example.com';
  if(!pub || !priv) return json({error:'VAPID keys are not configured'},500);

  webpush.setVapidDetails(subject,pub,priv);

  try{
    await webpush.sendNotification(user.subscription,JSON.stringify({
      title:'Move',
      body:'Test successful 🌿 What are you noticing right now?',
      url:'/?checkin=1',
      tag:'move-test'
    }));
    return json({ok:true});
  }catch(err){
    console.error(err);
    return json({error:`Push service error ${err?.statusCode||''}`.trim()},500);
  }
};
